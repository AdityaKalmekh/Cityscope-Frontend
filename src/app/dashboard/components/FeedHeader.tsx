import React from 'react';
import { Plus, Filter } from 'lucide-react';
import { FilterType, PostTypeConfig } from './types';

interface FeedHeaderProps {
    locationFilter: string;
    setLocationFilter: (filter: string) => void;
    filterType: FilterType;
    setFilterType: (type: FilterType) => void;
    setIsModalOpen: (open: boolean) => void;
    userCity: string;
    availableCities: string[];
    postTypes: PostTypeConfig[];
}

const FeedHeader: React.FC<FeedHeaderProps> = ({
    locationFilter,
    setLocationFilter,
    filterType,
    setFilterType,
    setIsModalOpen,
    userCity,
    availableCities,
    postTypes
}) => {
    return (
        <div className="bg-white shadow-sm p-4 lg:p-6 border-b">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Community Feed
                        {locationFilter && locationFilter !== userCity && (
                            <span className="text-lg font-normal text-gray-600 ml-2">
                                - {locationFilter}
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="hidden lg:flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        type="button"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Post</span>
                    </button>
                </div>

                <div className="space-y-3">
                    {/* Location Filter */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <label className="text-sm font-medium text-gray-700">Location:</label>
                        </div>
                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {/* <option value="">My City ({userCity})</option>
                            {availableCities.filter(city => city !== userCity).map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))} */}
                            <option value="">Select a city</option>
                            {availableCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    {/* Post Type Filter Tabs */}
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'all'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                            type="button"
                        >
                            All Posts
                        </button>
                        {postTypes.map(type => (
                            <button
                                key={type.value}
                                onClick={() => setFilterType(type.value)}
                                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${filterType === type.value
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                type="button"
                            >
                                {type.label.split(' ').slice(1).join(' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedHeader;