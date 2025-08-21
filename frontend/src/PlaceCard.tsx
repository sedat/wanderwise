import { ThumbsUp, ThumbsDown, Star, MapPin, DollarSign, Users } from 'lucide-react';

interface Place {
  location_id: string;
  name: string;
  distance: string;
  bearing: string;
  address: string;
  rating: number | null;
  reviews: number;
  price_level: string | null;
  cuisine: string[];
  category: string;
}

interface PlaceCardProps {
  place: Place;
  onFeedback: (feedback: { location_id: string; rating: 'like' | 'dislike' }) => void;
}

export function PlaceCard({ place, onFeedback }: PlaceCardProps) {
  const formatDistance = (distance: string) => {
    const distanceNum = parseFloat(distance);
    if (distanceNum < 1) {
      return `${(distanceNum * 1000).toFixed(0)}m`;
    }
    return `${distanceNum.toFixed(1)}km`;
  };

  const getPriceLevelDisplay = (priceLevel: string | null) => {
    if (!priceLevel) return null;
    const dollarSigns = priceLevel.replace(/\$/g, '');
    return '💰'.repeat(dollarSigns.length);
  };

  return (
    <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
            {place.name}
          </h3>
          <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">
              {formatDistance(place.distance)}
            </span>
          </div>
        </div>

        {/* Address */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{place.address}</p>

        {/* Rating and Reviews */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {place.rating ? (
              <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-gray-900">{place.rating}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">New</span>
              </div>
            )}
            
            {place.reviews > 0 && (
              <div className="flex items-center space-x-1 text-gray-500">
                <Users className="w-3 h-3" />
                <span className="text-xs">{place.reviews}</span>
              </div>
            )}
          </div>

          {place.price_level && (
            <div className="flex items-center space-x-1">
              <DollarSign className="w-3 h-3 text-gray-400" />
              <span className="text-sm text-gray-600">{place.price_level}</span>
            </div>
          )}
        </div>

        {/* Cuisine Tags */}
        {place.cuisine && place.cuisine.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {place.cuisine.slice(0, 3).map((cuisine: string) => (
              <span 
                key={cuisine} 
                className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
              >
                {cuisine}
              </span>
            ))}
            {place.cuisine.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-full">
                +{place.cuisine.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Category */}
        <div className="mb-4">
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full capitalize">
            {place.category}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3 pt-2">
          <button 
            onClick={() => onFeedback({ location_id: place.location_id, rating: 'dislike' })} 
            className="flex items-center justify-center w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md"
            aria-label="Dislike"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onFeedback({ location_id: place.location_id, rating: 'like' })} 
            className="flex items-center justify-center w-10 h-10 bg-green-50 hover:bg-green-100 text-green-600 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md"
            aria-label="Like"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
