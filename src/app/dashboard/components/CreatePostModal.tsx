import React from 'react';
import { X, ImageIcon, Send } from 'lucide-react';
import { PostFormData, PostTypeConfig } from './types'
import SmartImage from './SmartImage';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    postForm: PostFormData;
    setPostForm: React.Dispatch<React.SetStateAction<PostFormData>>;
    onSubmit: () => void;
    isLoading: boolean;
    availableCities: string[];
    postTypes: PostTypeConfig[];
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
    isOpen,
    onClose,
    postForm,
    setPostForm,
    onSubmit,
    isLoading,
    availableCities,
    postTypes,
    onImageChange,
    onRemoveImage
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            type="button"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                What&apos;s happening in your neighborhood?
                            </label>
                            <textarea
                                value={postForm.content}
                                onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Share your thoughts, recommendations, or ask for help..."
                                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                maxLength={280}
                            />
                            <div className="text-right text-sm text-gray-500 mt-1">
                                {postForm.content.length}/280
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
                            <select
                                value={postForm.postType}
                                onChange={(e) => setPostForm(prev => ({ ...prev, postType: e.target.value as PostFormData['postType'] }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {postTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <select
                                value={postForm.city}
                                onChange={(e) => setPostForm(prev => ({ ...prev, city: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {availableCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Image (Optional)
                            </label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={onImageChange}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <ImageIcon className="w-5 h-5" />
                                            <span className="text-sm font-medium">
                                                {postForm.image ? 'Change Image' : 'Choose Image'}
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                {postForm.imagePreview && (
                                    <div className="relative">
                                        <SmartImage 
                                            src={postForm.imagePreview} 
                                            alt="Preview"
                                            containerClassName="relative h-40 w-full"
                                        />
                                        <button
                                            type="button"
                                            onClick={onRemoveImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {postForm.image && (
                                    <div className="text-sm text-gray-500">
                                        <p>File: {postForm.image.name}</p>
                                        <p>Size: {(postForm.image.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            type="button"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={!postForm.content.trim() || isLoading}
                            className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                            type="button"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Posting...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span>Post</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;