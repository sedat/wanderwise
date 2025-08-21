import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { usePreferencesStore } from './App';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreferencesModal({ isOpen, onClose }: PreferencesModalProps) {
  const queryClient = useQueryClient();
  const { addPreference, deletePreference } = usePreferencesStore();
  const [newPreferenceName, setNewPreferenceName] = useState('');
  const [newPreferenceType, setNewPreferenceType] = useState('cuisine');

  const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

  const { data: preferences = [], isLoading } = useQuery({
    queryKey: ['preferences', '123'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/users/123/preferences`);
      if (!response.ok) {
        throw new Error(`Failed to fetch preferences: ${response.status}`);
      }
      return response.json();
    },
    enabled: isOpen,
  });

  const addPreferenceMutation = useMutation({
    mutationFn: (preference: any) => addPreference('123', preference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences', '123'] });
      setNewPreferenceName('');
    },
  });

  const deletePreferenceMutation = useMutation({
    mutationFn: (preferenceId: string) => deletePreference('123', preferenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences', '123'] });
    },
  });

  const handleAddPreference = () => {
    if (newPreferenceName.trim()) {
      const preference = {
        preference_type: newPreferenceType,
        preference_name: newPreferenceName.trim(),
        score: 0.7
      };
      addPreferenceMutation.mutate(preference);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Your Preferences</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading preferences...</p>
            </div>
          ) : (
            <>
              {/* Current Preferences */}
              {preferences.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {preferences.map((pref: any) => (
                    <div key={pref.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            {pref.preference_type}
                          </span>
                          <span className="font-medium text-gray-900">{pref.preference_name}</span>
                        </div>
                        <div className="mt-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full transition-all duration-300"
                                style={{ width: `${pref.score * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {Math.round(pref.score * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => deletePreferenceMutation.mutate(pref.id)}
                        disabled={deletePreferenceMutation.isPending}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No preferences yet. Add some to get better recommendations!</p>
                </div>
              )}

              {/* Add New Preference */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Add New Preference</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={newPreferenceType}
                      onChange={(e) => setNewPreferenceType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="cuisine">Cuisine</option>
                      <option value="category">Category</option>
                      <option value="price_level">Price Level</option>
                      <option value="ambiance">Ambiance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preference
                    </label>
                    <input
                      type="text"
                      value={newPreferenceName}
                      onChange={(e) => setNewPreferenceName(e.target.value)}
                      placeholder="e.g., Italian, Fine Dining, Quiet"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddPreference()}
                    />
                  </div>
                  <button
                    onClick={handleAddPreference}
                    disabled={!newPreferenceName.trim() || addPreferenceMutation.isPending}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{addPreferenceMutation.isPending ? 'Adding...' : 'Add Preference'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
