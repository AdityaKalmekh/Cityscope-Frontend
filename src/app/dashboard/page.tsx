'use client'
import React, { useState, useEffect } from 'react';
import {
    Home,
    Plus,
    MapPin,
    Heart,
    MessageCircle,
    ThumbsDown,
    X,
    ImageIcon,
    Send,
    Menu,
    User,
    Filter
} from 'lucide-react';
import Image from 'next/image';
import useHttp from '@/hooks/useHttp';

// TypeScript interfaces
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

interface PostApiResponse {
    post: Post;
}

interface PostsFeedResponse {
    posts: Post[];
}

interface Author {
    _id?: string;
    firstName: string;
    lastName: string;
    email?: string;
    bio?: string;
    isVerified: boolean;
}

interface Reply {
    _id: string;
    content: string;
    author: Author;
    createdAt: Date;
    updatedAt?: Date;
}

interface Post {
    _id: string;
    content: string;
    postType: 'recommend' | 'help' | 'update' | 'event';
    author: Author;
    city: string;
    likes: string[];
    dislikes: string[];
    replies: Reply[];
    createdAt: Date;
    updatedAt?: Date;
    image?: string;
    isActive?: boolean;
}

interface PostFormData {
    content: string;
    postType: 'recommend' | 'help' | 'update' | 'event';
    city: string;
    image: File | null;
    imagePreview: string;
}

interface PostTypeConfig {
    value: 'recommend' | 'help' | 'update' | 'event';
    label: string;
    color: string;
}

interface DashboardState {
    isModalOpen: boolean;
    isSidebarOpen: boolean;
    activeTab: 'home' | 'profile';
    posts: Post[];
    filterType: 'all' | 'recommend' | 'help' | 'update' | 'event';
    locationFilter: string; // New location filter state
    postForm: PostFormData;
    userCity: string; // User's default city
    isLoading: boolean;
}

const Dashboard: React.FC = () => {
    const feedHttp = useHttp<ApiResponse<PostsFeedResponse>>();
    const createPostHttp = useHttp<ApiResponse<PostApiResponse>>();
    const toggleLikeHttp = useHttp<ApiResponse<PostApiResponse>>();
    const toggleDislikeHttp = useHttp<ApiResponse<PostApiResponse>>();

    // Available cities
    const availableCities: string[] = ['Ahmedabad', 'Mumbai', 'Pune', 'Surat'];

    // State with proper typing
    const [state, setState] = useState<DashboardState>({
        isModalOpen: false,
        isSidebarOpen: false,
        activeTab: 'home',
        posts: [],
        filterType: 'all',
        locationFilter: '', // Will be set to user's city initially
        postForm: {
            content: '',
            postType: 'recommend',
            city: 'Surat', // Default city
            image: null,
            imagePreview: ''
        },
        userCity: 'Surat', // Default, will be updated from user profile
        isLoading: true
    });

    // Destructure state for easier access
    const {
        isModalOpen,
        isSidebarOpen,
        activeTab,
        posts,
        filterType,
        locationFilter,
        postForm,
        userCity,
        isLoading
    } = state;

    // Post type configurations with proper typing
    const postTypes: PostTypeConfig[] = [
        { value: 'recommend', label: '📍 Recommend a place', color: 'bg-green-100 text-green-800' },
        { value: 'help', label: '🆘 Ask for help', color: 'bg-orange-100 text-orange-800' },
        { value: 'update', label: '📢 Share update', color: 'bg-blue-100 text-blue-800' },
        { value: 'event', label: '🎉 Event announcement', color: 'bg-purple-100 text-purple-800' }
    ];

    // Update state helper function
    const updateState = (updates: Partial<DashboardState>): void => {
        setState(prevState => ({ ...prevState, ...updates }));
    };

    // Update post form helper function
    const updatePostForm = (updates: Partial<PostFormData>): void => {
        updateState({
            postForm: { ...postForm, ...updates }
        });
    };

    // Fetch user's feed based on their city and filters
    const fetchFeed = async (): Promise<void> => {
        try {
            updateState({ isLoading: true });

            // Build query parameters
            const queryParams = new URLSearchParams();
            
            // Add post type filter
            if (filterType !== 'all') {
                queryParams.append('postType', filterType);
            }
            
            // Add location filter (if different from user's default city)
            if (locationFilter && locationFilter !== userCity) {
                queryParams.append('city', locationFilter);
            }

            // Always sort by newest
            queryParams.append('sortBy', 'newest');

            const endpoint = `/api/posts/feed${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

            await feedHttp.sendRequest(
                {
                    url: endpoint,
                    method: 'GET'
                },
                (data) => {
                    if (data?.success && data?.data?.posts) {
                        updateState({ 
                            posts: data.data.posts,
                            isLoading: false 
                        });
                    }
                },
                (error) => {
                    console.error('Failed to fetch feed:', error.message);
                    updateState({ isLoading: false });
                }
            );
        } catch (error) {
            console.error('Error fetching feed:', error);
            updateState({ isLoading: false });
        }
    };

    // Initial load - fetch user's city feed
    useEffect(() => {
        fetchFeed();
    }, [filterType, locationFilter]);

    // Handle post creation with API Call
    const handleCreatePost = async (): Promise<void> => {
        if (!postForm.content.trim()) return;

        try {
            const formData = new FormData();
            formData.append('content', postForm.content.trim());
            formData.append('postType', postForm.postType);
            formData.append('city', postForm.city);

            // Add image file if selected
            if (postForm.image) {
                formData.append('image', postForm.image);
            }

            await createPostHttp.sendRequest(
                {
                    url: '/api/posts',
                    method: 'POST',
                    data: formData,
                },
                (data) => {
                    if (data?.success && data?.data?.post) {
                        // Add the new post to the beginning of the posts array
                        updateState({
                            posts: [data.data.post, ...posts],
                            postForm: {
                                content: '',
                                postType: 'recommend',
                                city: userCity, // Reset to user's city
                                image: null,
                                imagePreview: ''
                            },
                            isModalOpen: false
                        });

                        // Clean up preview URL
                        if (postForm.imagePreview) {
                            URL.revokeObjectURL(postForm.imagePreview);
                        }
                    }
                },
                (error) => {
                    console.error('Failed to create post:', error.message);
                    alert('Failed to create post: ' + error.message);
                }
            );
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        }
    };

    // Handle like toggle
    const toggleLike = async (postId: string): Promise<void> => {
        try {
            await toggleLikeHttp.sendRequest(
                {
                    url: `/api/posts/${postId}/like`,
                    method: 'POST'
                },
                (data) => {
                    if (data?.success && data?.data?.post) {
                        // Update the specific post in the posts array
                        const updatedPosts = posts.map((post: Post) => {
                            if (post._id === postId) {
                                return data.data!.post;
                            }
                            return post;
                        });
                        updateState({ posts: updatedPosts });
                    }
                },
                (error) => {
                    console.error('Failed to toggle like:', error.message);
                }
            );
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // Handle dislike toggle
    const toggleDislike = async (postId: string): Promise<void> => {
        try {
            await toggleDislikeHttp.sendRequest(
                {
                    url: `/api/posts/${postId}/dislike`,
                    method: 'POST'
                },
                (data) => {
                    if (data?.success && data?.data?.post) {
                        // Update the specific post in the posts array
                        const updatedPosts = posts.map((post: Post) => {
                            if (post._id === postId) {
                                return data.data!.post;
                            }
                            return post;
                        });
                        updateState({ posts: updatedPosts });
                    }
                },
                (error) => {
                    console.error('Failed to toggle dislike:', error.message);
                }
            );
        } catch (error) {
            console.error('Error toggling dislike:', error);
        }
    };

    // Get post type configuration
    const getPostTypeConfig = (type: Post['postType']): PostTypeConfig => {
        return postTypes.find((pt: PostTypeConfig) => pt.value === type) || postTypes[0];
    };

    // Format time ago utility
    const formatTimeAgo = (date: Date): string => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d`;
        if (hours > 0) return `${hours}h`;
        if (minutes > 0) return `${minutes}m`;
        return 'now';
    };

    // Handle input changes
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        updatePostForm({ content: e.target.value });
    };

    const handlePostTypeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        updatePostForm({ postType: e.target.value as PostFormData['postType'] });
    };

    const handlePostCityChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        updatePostForm({ city: e.target.value });
    };

    const handleLocationFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        updateState({ locationFilter: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                alert('Please select an image smaller than 5MB');
                return;
            }

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            updatePostForm({
                image: file,
                imagePreview: previewUrl
            });
        } else {
            updatePostForm({
                image: null,
                imagePreview: ''
            });
        }
    };

    const handleRemoveImage = (): void => {
        // Clean up the preview URL to prevent memory leaks
        if (postForm.imagePreview) {
            URL.revokeObjectURL(postForm.imagePreview);
        }
        updatePostForm({
            image: null,
            imagePreview: ''
        });
    };

    // Event handlers with proper typing
    const handleSidebarToggle = (): void => {
        updateState({ isSidebarOpen: !isSidebarOpen });
    };

    const handleModalToggle = (): void => {
        // Set user's city as default for new posts
        updateState({ 
            isModalOpen: !isModalOpen,
            postForm: {
                ...postForm,
                city: userCity
            }
        });
    };

    const handleFilterChange = (newFilter: DashboardState['filterType']): void => {
        updateState({ filterType: newFilter });
    };

    const handleTabChange = (tab: DashboardState['activeTab']): void => {
        updateState({
            activeTab: tab,
            isSidebarOpen: false
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => updateState({ isSidebarOpen: false })}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <div className="flex items-center space-x-3">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">Cityscope</h1>
                        </div>
                        <button
                            onClick={() => updateState({ isSidebarOpen: false })}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                            type="button"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        <button
                            onClick={() => handleTabChange('home')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${activeTab === 'home'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            type="button"
                        >
                            <Home className="w-5 h-5" />
                            <span className="font-medium">Home</span>
                        </button>

                        <button
                            onClick={() => {
                                updateState({ isModalOpen: true, isSidebarOpen: false });
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                            type="button"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Create Post</span>
                        </button>
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gray-200 p-2 rounded-full">
                                <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Current User</p>
                                <p className="text-sm text-gray-500">📍 {userCity}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-0">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
                    <button
                        onClick={handleSidebarToggle}
                        className="p-2 rounded-lg hover:bg-gray-100"
                        type="button"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="font-bold text-gray-900">Cityscope</h1>
                    <button
                        onClick={handleModalToggle}
                        className="bg-indigo-600 p-2 rounded-lg text-white hover:bg-indigo-700"
                        type="button"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Feed Header */}
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
                                onClick={handleModalToggle}
                                className="hidden lg:flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                type="button"
                            >
                                <Plus className="w-5 h-5" />
                                <span>New Post</span>
                            </button>
                        </div>

                        {/* Filters Row */}
                        <div className="space-y-3">
                            {/* Location Filter */}
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <label className="text-sm font-medium text-gray-700">Location:</label>
                                </div>
                                <select
                                    value={locationFilter}
                                    onChange={handleLocationFilterChange}
                                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">My City ({userCity})</option>
                                    {availableCities.filter(city => city !== userCity).map((city: string) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Post Type Filter Tabs */}
                            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
                                <button
                                    onClick={() => handleFilterChange('all')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'all'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    type="button"
                                >
                                    All Posts
                                </button>
                                {postTypes.map((type: PostTypeConfig) => (
                                    <button
                                        key={type.value}
                                        onClick={() => handleFilterChange(type.value)}
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

                {/* Posts Feed */}
                <div className="flex-1 p-4 lg:p-6">
                    <div className="max-w-2xl mx-auto space-y-6">
                        {/* Loading State */}
                        {isLoading && (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                <p className="text-gray-500">Loading posts...</p>
                            </div>
                        )}

                        {/* Posts */}
                        {!isLoading && posts.map((post: Post) => {
                            const typeConfig = getPostTypeConfig(post.postType);
                            const isLiked = post.likes.includes('currentUser');
                            const isDisliked = post.dislikes.includes('currentUser');

                            return (
                                <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    {/* Post Header */}
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
                                                        <span>{formatTimeAgo(post.createdAt)}</span>
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

                                        {/* Post Content */}
                                        <p className="text-gray-900 mb-4 leading-relaxed">{post.content}</p>

                                        {/* Post Image */}
                                        {post.image && (
                                            <div className="mb-4 rounded-lg overflow-hidden">
                                                <img
                                                    src={post.image}
                                                    alt="Post image"
                                                    className="w-full h-64 object-cover"
                                                />
                                            </div>
                                        )}

                                        {/* Post Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center space-x-6">
                                                <button
                                                    onClick={() => toggleLike(post._id)}
                                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isLiked
                                                        ? 'bg-red-50 text-red-600'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                    type="button"
                                                >
                                                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                                    <span className="text-sm font-medium">{post.likes.length}</span>
                                                </button>

                                                <button
                                                    onClick={() => toggleDislike(post._id)}
                                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isDisliked
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

                                        {/* Replies */}
                                        {post.replies.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                                {post.replies.map((reply: Reply) => (
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
                                                                        {formatTimeAgo(reply.createdAt)}
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
                        })}

                        {/* Empty State */}
                        {!isLoading && posts.length === 0 && (
                            <div className="text-center py-12">
                                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                                    <MessageCircle className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No posts in {locationFilter || userCity}
                                </h3>
                                <p className="text-gray-500 mb-4">Be the first to share something with your community!</p>
                                <button
                                    onClick={handleModalToggle}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                    type="button"
                                >
                                    Create First Post
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
                                <button
                                    onClick={() => updateState({ isModalOpen: false })}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    type="button"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        What&apos;s happening in your neighborhood?
                                    </label>
                                    <textarea
                                        value={postForm.content}
                                        onChange={handleContentChange}
                                        placeholder="Share your thoughts, recommendations, or ask for help..."
                                        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                        maxLength={280}
                                    />
                                    <div className="text-right text-sm text-gray-500 mt-1">
                                        {postForm.content.length}/280
                                    </div>
                                </div>

                                {/* Post Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Post Type
                                    </label>
                                    <select
                                        value={postForm.postType}
                                        onChange={handlePostTypeChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {postTypes.map((type: PostTypeConfig) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City
                                    </label>
                                    <select
                                        value={postForm.city}
                                        onChange={handlePostCityChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {availableCities.map((city: string) => (
                                            <option key={city} value={city}>
                                                {city}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Image (Optional)
                                    </label>
                                    <div className="space-y-3">
                                        {/* File Input */}
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
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

                                        {/* Image Preview */}
                                        {postForm.imagePreview && (
                                            <div className="relative">
                                                <img
                                                    src={postForm.imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        {/* File Info */}
                                        {postForm.image && (
                                            <div className="text-sm text-gray-500">
                                                <p>File: {postForm.image.name}</p>
                                                <p>Size: {(postForm.image.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => updateState({ isModalOpen: false })}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    type="button"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreatePost}
                                    disabled={!postForm.content.trim() || createPostHttp.isLoading}
                                    className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                                    type="button"
                                >
                                    {createPostHttp.isLoading ? (
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
            )}
        </div>
    );
};

export default Dashboard;