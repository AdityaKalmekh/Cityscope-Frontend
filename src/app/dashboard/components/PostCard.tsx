import React from 'react';
import { User, MapPin, Heart, MessageCircle, ThumbsDown } from 'lucide-react';
import { Post, PostTypeConfig } from './types';
import SmartImage from './SmartImage';
import ClientTimeDisplay from './ClientTimeDisplay';

interface PostCardProps {
    post: Post;
    postTypes: PostTypeConfig[];
    onLike: (postId: string) => void;
    onDislike: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
    post,
    postTypes,
    onLike,
    onDislike
}) => {
    const getPostTypeConfig = (type: Post['postType']) => {
        return postTypes.find(pt => pt.value === type) || postTypes[0];
    };

    const typeConfig = getPostTypeConfig(post.postType);
    const isLiked = post.likes.includes('currentUser');
    const isDisliked = post.dislikes.includes('currentUser');

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 lg:p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gray-200 p-2 rounded-full">
                            <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900">
                                    {post.author.firstName} {post.author.lastName}
                                </h3>
                                {post.author.isVerified && (
                                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <ClientTimeDisplay date={post.createdAt} />
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{post.city}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
                        {typeConfig.label}
                    </span>
                </div>

                <p className="text-gray-900 mb-4 leading-relaxed">{post.content}</p>

                {post.image && (
                    <div className="mb-4">
                        <SmartImage 
                            src={post.image} 
                            alt="Post image"
                            containerClassName="relative h-64 w-full"
                        />
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={() => onLike(post._id)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                                isLiked
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            type="button"
                        >
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            <span className="text-sm font-medium">{post.likes.length}</span>
                        </button>

                        <button
                            onClick={() => onDislike(post._id)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                                isDisliked
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            type="button"
                        >
                            <ThumbsDown className={`w-5 h-5 ${isDisliked ? 'fill-current' : ''}`} />
                            <span className="text-sm font-medium">{post.dislikes.length}</span>
                        </button>

                        <button 
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                            type="button"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">{post.replies.length}</span>
                        </button>
                    </div>
                </div>

                {post.replies.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        {post.replies.map(reply => (
                            <div key={reply._id} className="flex space-x-3">
                                <div className="bg-gray-200 p-1.5 rounded-full">
                                    <User className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="font-medium text-sm text-gray-900">
                                                {reply.author.firstName} {reply.author.lastName}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                <ClientTimeDisplay date={reply.createdAt} />
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">{reply.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCard;