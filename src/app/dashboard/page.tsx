'use client'
import React, { useState, useEffect } from 'react';
import useHttp from '@/hooks/useHttp';

import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import FeedHeader from './components/FeedHeader';
import PostCard from './components/PostCard';
import CreatePostModal from './components/CreatePostModal';
import LoadingState from './components/LoadingState';
import EmptyState from './components/EmptyState';

import { 
    ApiResponse, 
    PostApiResponse, 
    PostsFeedResponse, 
    Post, 
    PostFormData, 
    PostTypeConfig, 
    FilterType, 
    ActiveTab 
} from './components/types';

const Dashboard: React.FC = () => {
    const feedHttp = useHttp<ApiResponse<PostsFeedResponse>>();
    const createPostHttp = useHttp<ApiResponse<PostApiResponse>>();
    const toggleLikeHttp = useHttp<ApiResponse<PostApiResponse>>();
    const toggleDislikeHttp = useHttp<ApiResponse<PostApiResponse>>();

    // Available cities
    const availableCities: string[] = ['Ahmedabad', 'Mumbai', 'Pune', 'Surat'];

    // Post type configurations
    const postTypes: PostTypeConfig[] = [
        { value: 'recommend', label: '📍 Recommend a place', color: 'bg-green-100 text-green-800' },
        { value: 'help', label: '🆘 Ask for help', color: 'bg-orange-100 text-orange-800' },
        { value: 'update', label: '📢 Share update', color: 'bg-blue-100 text-blue-800' },
        { value: 'event', label: '🎉 Event announcement', color: 'bg-purple-100 text-purple-800' }
    ];

    // State
    const [mounted, setMounted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('home');
    const [posts, setPosts] = useState<Post[]>([]);
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [locationFilter, setLocationFilter] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [userCity, _setUserCity] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [postForm, setPostForm] = useState<PostFormData>({
        content: '',
        postType: 'recommend',
        city: '',
        image: null,
        imagePreview: ''
    });

    // Handle mounting to prevent hydration issues
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Effects - fetch posts when filters change
    useEffect(() => {
        const fetchFeed = async () => {
            if (!mounted) return;

            try {
                setIsLoading(true);
                const queryParams = new URLSearchParams();
                
                if (filterType !== 'all') queryParams.append('postType', filterType);
                if (locationFilter && locationFilter !== userCity) queryParams.append('city', locationFilter);
                queryParams.append('sortBy', 'newest');

                const endpoint = `/api/posts/feed${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

                await feedHttp.sendRequest(
                    { url: endpoint, method: 'GET' },
                    (data) => {
                        if (data?.success && data?.data?.posts) {
                            setPosts(data.data.posts);
                        }
                        setIsLoading(false);
                    },
                    (error) => {
                        console.error('Failed to fetch feed:', error);
                        setIsLoading(false);
                    }
                );
            } catch (error) {
                console.error('Error fetching feed:', error);
                setIsLoading(false);
            }
        };

        if (mounted) {
            fetchFeed();
        }
        // feedHttp is intentionally not included in dependencies to prevent infinite re-renders
        // eslint-disable-next-line react-hooks/exhaustive-deps  
    }, [mounted, filterType, locationFilter, userCity]);

    // Handle post creation
    const handleCreatePost = async () => {
        if (!postForm.content.trim()) return;

        try {
            const formData = new FormData();
            formData.append('content', postForm.content.trim());
            formData.append('postType', postForm.postType);
            formData.append('city', postForm.city);
            if (postForm.image) formData.append('image', postForm.image);

            await createPostHttp.sendRequest(
                { url: '/api/posts', method: 'POST', data: formData },
                (data) => {
                    if (data?.success && data?.data?.post) {
                        setPosts(prev => [data.data!.post, ...prev]);
                        setPostForm({
                            content: '',
                            postType: 'recommend',
                            city: userCity,
                            image: null,
                            imagePreview: ''
                        });
                        setIsModalOpen(false);

                        if (postForm.imagePreview) {
                            URL.revokeObjectURL(postForm.imagePreview);
                        }
                    }
                },
                (error) => {
                    console.error('Failed to create post:', error);
                    alert('Failed to create post: ' + error.message);
                }
            );
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        }
    };

    // Handle like/dislike
    const handleLike = async (postId: string) => {
        try {
            await toggleLikeHttp.sendRequest(
                { url: `/api/posts/${postId}/like`, method: 'POST' },
                (data) => {
                    if (data?.success && data?.data?.post) {
                        setPosts(prev => prev.map(post => 
                            post._id === postId ? data.data!.post : post
                        ));
                    }
                }
            );
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleDislike = async (postId: string) => {
        try {
            await toggleDislikeHttp.sendRequest(
                { url: `/api/posts/${postId}/dislike`, method: 'POST' },
                (data) => {
                    if (data?.success && data?.data?.post) {
                        setPosts(prev => prev.map(post => 
                            post._id === postId ? data.data!.post : post
                        ));
                    }
                }
            );
        } catch (error) {
            console.error('Error toggling dislike:', error);
        }
    };

    // Handle image upload
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
                return;
            }

            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('Please select an image smaller than 5MB');
                return;
            }

            const previewUrl = URL.createObjectURL(file);
            setPostForm(prev => ({ ...prev, image: file, imagePreview: previewUrl }));
        }
    };

    const handleRemoveImage = () => {
        if (postForm.imagePreview) {
            URL.revokeObjectURL(postForm.imagePreview);
        }
        setPostForm(prev => ({ ...prev, image: null, imagePreview: '' }));
    };

    // Don't render until mounted to prevent hydration issues
    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingState message="Loading Cityscope..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setIsModalOpen={setIsModalOpen}
                userCity={userCity}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-0">
                <MobileHeader
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    setIsModalOpen={setIsModalOpen}
                />

                <FeedHeader
                    locationFilter={locationFilter}
                    setLocationFilter={setLocationFilter}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    setIsModalOpen={setIsModalOpen}
                    userCity={userCity}
                    availableCities={availableCities}
                    postTypes={postTypes}
                />

                {/* Posts Feed */}
                <div className="flex-1 p-4 lg:p-6">
                    <div className="max-w-2xl mx-auto space-y-6">
                        {/* Loading State */}
                        {isLoading && <LoadingState />}

                        {/* Posts */}
                        {!isLoading && posts.map(post => (
                            <PostCard
                                key={post._id}
                                post={post}
                                postTypes={postTypes}
                                onLike={handleLike}
                                onDislike={handleDislike}
                            />
                        ))}

                        {/* Empty State */}
                        {!isLoading && posts.length === 0 && (
                            <EmptyState
                                city={locationFilter || userCity}
                                onCreatePost={() => setIsModalOpen(true)}
                            />
                        )}
                    </div>
                </div>
            </div>

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                postForm={postForm}
                setPostForm={setPostForm}
                onSubmit={handleCreatePost}
                isLoading={createPostHttp.isLoading}
                availableCities={availableCities}
                postTypes={postTypes}
                onImageChange={handleImageChange}
                onRemoveImage={handleRemoveImage}
            />
        </div>
    );
};

export default Dashboard;