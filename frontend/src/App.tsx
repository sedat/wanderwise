import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import { MapPin, Settings, Sparkles, Loader2 } from 'lucide-react';

import { PreferencesModal } from './PreferencesModal';
import { PlaceCard } from './PlaceCard';

// Zustand store for user preferences
interface PreferencesState {
  preferences: any[];
  fetchPreferences: (userId: string) => Promise<void>;
  addPreference: (userId: string, preference: any) => Promise<void>;
  deletePreference: (userId: string, preferenceId: string) => Promise<void>;
}

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: [],
  fetchPreferences: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/preferences`);
      if (!response.ok) {
        throw new Error(`Failed to fetch preferences: ${response.status}`);
      }
      const data = await response.json();
      set({ preferences: data });
    } catch (error) {
      console.error('Error fetching preferences:', error);
      throw error;
    }
  },
  addPreference: async (userId, preference) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preference),
      });
      if (!response.ok) {
        throw new Error(`Failed to add preference: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding preference:', error);
      throw error;
    }
  },
  deletePreference: async (userId, preferenceId) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/preferences/${preferenceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to delete preference: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting preference:', error);
      throw error;
    }
  },
}));

// Main App component
function App() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const queryClient = useQueryClient();

  const suggestionsMutation = useMutation({
    mutationFn: async (location: { latitude: number; longitude: number }) => {
      const response = await fetch(`${API_URL}/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...location, user_id: '123' }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async (feedback: { location_id: string; rating: 'like' | 'dislike' }) => {
      // Convert like/dislike to 1-5 star rating scale
      // 'like' = 5 stars, 'dislike' = 1 star
      const ratingValue = feedback.rating === 'like' ? 5 : 1;
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: '123', 
          location_id: feedback.location_id, 
          rating: ratingValue 
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to submit feedback: ${response.status}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
    onError: (error) => {
      console.error('Error submitting feedback:', error);
    },
  });

  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude })
      suggestionsMutation.mutate({ latitude: position.coords.latitude, longitude: position.coords.longitude })
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/80 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  WanderWise
                </h1>
                <p className="text-xs text-gray-500">AI-powered local discovery</p>
              </div>
            </div>
            <button 
              onClick={() => setIsPreferencesOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-white/20 rounded-full text-gray-700 hover:text-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Preferences</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {!suggestionsMutation.data && (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-2xl inline-block mb-6">
              <MapPin className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Places
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get personalized recommendations for restaurants, cafes, and hidden gems based on your location and preferences.
            </p>
            <button
              onClick={handleGetLocation}
              disabled={suggestionsMutation.isPending}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {suggestionsMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Finding perfect spots...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  <span>Get My Suggestions</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Loading State */}
        {suggestionsMutation.isPending && (
          <div className="text-center py-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 inline-block shadow-lg">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">Analyzing your location and preferences...</p>
              <p className="text-sm text-gray-500 mt-2">This usually takes just a few seconds</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {suggestionsMutation.isError && (
          <div className="text-center py-12">
            <div className="bg-red-50/60 backdrop-blur-sm border border-red-200 rounded-2xl p-8 inline-block shadow-lg">
              <p className="text-red-800 font-medium">Oops! Something went wrong</p>
              <p className="text-red-600 text-sm mt-2">{suggestionsMutation.error?.message}</p>
              <button
                onClick={handleGetLocation}
                className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Success State - AI Suggestion and Places */}
        {suggestionsMutation.isSuccess && suggestionsMutation.data && (
          <div className="space-y-8">
            {/* AI Suggestion Text */}
            {suggestionsMutation.data.suggestion && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg border border-blue-100">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Your Personal Recommendations</h3>
                    <div className="prose prose-lg text-gray-700 max-w-none">
                      {suggestionsMutation.data.suggestion.split('\n').map((paragraph: string, index: number) => (
                        paragraph.trim() && (
                          <p key={index} className="mb-3 leading-relaxed">
                            {paragraph}
                          </p>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Places Grid */}
            {suggestionsMutation.data.places && suggestionsMutation.data.places.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recommended Places</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestionsMutation.data.places.map((place: any) => (
                    <PlaceCard
                      key={place.location_id}
                      place={place}
                      onFeedback={(feedback: { location_id: string; rating: 'like' | 'dislike' }) => feedbackMutation.mutate(feedback)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* New Search Button */}
            <div className="text-center pt-8">
              <button
                onClick={handleGetLocation}
                disabled={suggestionsMutation.isPending}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl text-gray-700 hover:text-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <MapPin className="w-4 h-4" />
                <span>Get New Suggestions</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <PreferencesModal isOpen={isPreferencesOpen} onClose={() => setIsPreferencesOpen(false)} />
    </div>
  )
}

export default App