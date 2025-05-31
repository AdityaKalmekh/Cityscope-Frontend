import React from 'react';

interface LoadingStateProps {
    message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading posts..." }) => {
    return (
        <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">{message}</p>
        </div>
    );
};

export default LoadingState;