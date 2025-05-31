// SmartImage.tsx - Smart Image Component that handles both external URLs and blob URLs
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface SmartImageProps {
    src: string;
    alt: string;
    className?: string;
    containerClassName?: string;
    width?: number;
    height?: number;
}

const SmartImage: React.FC<SmartImageProps> = ({ 
    src, 
    alt, 
    className = "", 
    containerClassName = "relative h-64 w-full", 
    width, 
    height 
}) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Reset states when src changes
    useEffect(() => {
        setImageError(false);
        setIsLoading(true);
    }, [src]);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setImageError(true);
    };

    // Error fallback
    if (imageError) {
        return (
            <div className={`${containerClassName} bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center`}>
                <div className="text-center text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Image not available</p>
                </div>
            </div>
        );
    }

    // Check if it's a blob URL (from file preview)
    const isBlobUrl = src.startsWith('blob:') || src.startsWith('data:');

    return (
        <div className={`${containerClassName} bg-gray-100 rounded-lg overflow-hidden`}>
            {/* Loading indicator */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            )}
            
            <Image
                src={src}
                alt={alt}
                fill={!width && !height}
                width={width}
                height={height}
                className={`${className} object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onLoad={handleLoad}
                onError={handleError}
                unoptimized={isBlobUrl} // Don't optimize blob URLs
                priority={false}
            />
        </div>
    );
};

export default SmartImage;