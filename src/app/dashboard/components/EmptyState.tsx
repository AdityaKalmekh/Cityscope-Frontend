import React from 'react';
import { MessageCircle } from 'lucide-react';

interface EmptyStateProps {
    city: string;
    onCreatePost: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ city, onCreatePost }) => {
    return (
        <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
                No posts in {city}
            </h3>
            <p className="text-gray-500 mb-4">Be the first to share something with your community!</p>
            <button
                onClick={onCreatePost}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                type="button"
            >
                Create First Post
            </button>
        </div>
    );
};

export default EmptyState;