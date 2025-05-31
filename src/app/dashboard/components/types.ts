export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface PostApiResponse {
    post: Post;
}

export interface PostsFeedResponse {
    posts: Post[];
}

export interface Author {
    _id?: string;
    firstName: string;
    lastName: string;
    email?: string;
    bio?: string;
    isVerified: boolean;
}

export interface Reply {
    _id: string;
    content: string;
    author: Author;
    createdAt: Date;
    updatedAt?: Date;
}

export interface Post {
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

export interface PostFormData {
    content: string;
    postType: 'recommend' | 'help' | 'update' | 'event';
    city: string;
    image: File | null;
    imagePreview: string;
}

export interface PostTypeConfig {
    value: 'recommend' | 'help' | 'update' | 'event';
    label: string;
    color: string;
}

export type FilterType = 'all' | 'recommend' | 'help' | 'update' | 'event';
export type ActiveTab = 'home' | 'profile';