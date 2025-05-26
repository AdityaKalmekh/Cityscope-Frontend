export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      _id: string;
      email: string;
      firstName: string;
      lastName: string;
      bio: string;
      isVerified: boolean;
      postsCount: number;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    token: string;
    isNewUser: boolean;
  };
  error?: string;
}