'use client';

import React, { useState } from 'react';
import { MapPin, Check, AlertCircle } from 'lucide-react';
import useHttp from '../../hooks/useHttp'; // Adjust path as needed
import { useRouter } from 'next/navigation';

interface FormData {
  firstName: string;
  lastName: string;
  bio: string;
  city: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  bio?: string;
  city?: string;
}

interface ApiResponse {
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
  };
  error?: string;
}



const ProfileCompletion = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    bio: '',
    city: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>('');
  const router = useRouter();
  // Initialize HTTP hook for API calls
  const { sendRequest, isLoading, error: httpError } = useHttp<ApiResponse>();
  // City options
  const cityOptions = [
    { value: 'Ahmedabad', label: 'Ahmedabad' },
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Surat', label: 'Surat' },
    { value: 'Pune', label: 'Pune' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;

    // Handle bio character limit
    if (name === 'bio' && value.length > 160) {
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });

    // Clear API error when user starts typing
    if (apiError) {
      setApiError('');
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = 'First name cannot exceed 50 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = 'Last name cannot exceed 50 characters';
    }

    if (!formData.city) {
      newErrors.city = 'Please select a city';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      // Prepare request data
      const requestData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        bio: formData.bio.trim(),
        city: formData.city
      };

      // Make API call to update profile
      const response = await sendRequest(
        {
          url: '/api/profile',
          method: 'PUT',
          data: requestData
        },
        (responseData) => {
          console.log('Profile updated successfully:', responseData);
        },
        (error) => {
          console.error('Profile update failed:', error);
          setApiError(error.message || 'Failed to update profile');
        }
      );

      if (response && response.success) {
        router.push('/dashboard');
      }

    } catch (error) {
      console.error('Error completing profile:', error);
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid: boolean = formData.firstName.trim() !== '' && formData.lastName.trim() !== '';
  const hasError: boolean = !!apiError || !!httpError;
  const displayError: string = apiError || httpError?.message || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8">
        {/* Logo/Brand Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-full">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 text-sm px-2">
            Help your neighbors get to know you better
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 sm:space-y-6">
          {/* API Error Display */}
          {hasError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">Profile Update Failed</p>
                <p className="text-sm text-red-600 mt-1">{displayError}</p>
              </div>
            </div>
          )}
          {/* First Name Field */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm sm:text-base ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              placeholder="Enter your first name"
              maxLength={50}
              disabled={isSubmitting || isLoading}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name Field */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm sm:text-base ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              placeholder="Enter your last name"
              maxLength={50}
              disabled={isSubmitting || isLoading}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>

          {/* City Selection Field */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <select
              id="city"
              name="city"
              required
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm sm:text-base ${errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              disabled={isSubmitting || isLoading}
            >
              <option value="">Select your city</option>
              {cityOptions.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          {/* Bio Field */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-sm sm:text-base"
              placeholder="Tell your neighbors a bit about yourself..."
              maxLength={160}
              disabled={isSubmitting || isLoading}
            />
            <div className="mt-1 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
              <p className="text-xs text-gray-500">
                Share your interests, profession, or what you love about your neighborhood
              </p>
              <span className={`text-xs self-end sm:self-auto ${formData.bio.length > 140 ? 'text-orange-500' : 'text-gray-400'
                }`}>
                {formData.bio.length}/160
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting || isLoading}
            className={`w-full py-2.5 sm:py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center text-sm sm:text-base ${isFormValid && !isSubmitting && !isLoading
                ? 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {(isSubmitting || isLoading) ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                <span className="text-sm sm:text-base">Completing Profile...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span>Complete Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;