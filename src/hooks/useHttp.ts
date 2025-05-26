import { useState, useCallback, useRef } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/cityscope',
  withCredentials: true, // Equivalent to credentials: 'include'
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

axiosInstance.interceptors.request.use(request => {
  console.log('🚀 API Request:', request.baseURL);
  console.log('📤 Request Headers:', request.method);
  if (request.data) console.log('📦 Request Data:', request.data);
  return request;
});

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestConfig<T> extends Omit<AxiosRequestConfig, 'data' | 'method'> {
  url: string;
  method: HttpMethod;
  data?: T;
}

interface HttpResponse<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  progress: number;
  sendRequest: <D>(
    config: RequestConfig<D>,
    applyData?: (data: T) => void,
    handleError?: (error: Error) => void,
  ) => Promise<T | undefined>;
  cancelRequest: () => void;
  clearError: () => void;
}

const useHttp = <T>(): HttpResponse<T> => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<T | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const cancelRequest = useCallback(() => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Request cancelled by user');
      cancelTokenRef.current = null;
    }
  }, []);

  const sendRequest = useCallback(async <D>(
    requestConfig: RequestConfig<D>,
    applyData?: (data: T) => void,
    handleError?: (error: Error) => void
  ): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    // Create a new cancel token for this request
    cancelTokenRef.current = axios.CancelToken.source();

    try {
      // Create a properly typed headers object
      const axiosConfig: AxiosRequestConfig = {
        ...requestConfig,
        cancelToken: cancelTokenRef.current.token,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        }
      };

      // If sending FormData, remove the Content-Type header to let the browser set it
      if (requestConfig.data instanceof FormData) {
        axiosConfig.headers = {
          ...(requestConfig.headers || {}),
          'Content-Type': undefined // This will effectively remove the header
        };
      }

      const response: AxiosResponse<T> = await axiosInstance(axiosConfig);

      const responseData = response.data;
      setData(responseData);

      if (applyData) {
        applyData(responseData);
      }

      return responseData;
    } catch (err) {
      // Handle errors, including cancellation
      if (axios.isCancel(err)) {
        console.log('Request canceled:', err.message);
      } else {
        let errorMessage = 'Something went wrong';

        // Extract error message from axios error response if available
        if (axios.isAxiosError(err) && err.response?.data) {
          const responseData = err.response.data;
          errorMessage =
            (typeof responseData === 'object' && responseData !== null)
              ? (responseData.message || responseData.error || `Error ${err.response.status}: ${err.response.statusText}`)
              : `Error ${err.response.status}: ${err.response.statusText}`;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        const error = new Error(errorMessage);
        setError(error);

        if (handleError) {
          handleError(error);
        }
      }
    } finally {
      setIsLoading(false);
      cancelTokenRef.current = null;
    }
  }, []);

  return {
    data,
    error,
    isLoading,
    progress,
    sendRequest,
    cancelRequest,
    clearError
  };
};

axiosInstance.interceptors.request.use(
  (config) => {
    // You can add authentication headers here once the user is logged in
    // Example: const token = await AsyncStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common error scenarios
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors like 401 (Unauthorized)
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        // Handle token expiration, logout user, redirect to login, etc.
        // Example: store.dispatch(logout());
        console.log('Session expired. Please login again.');
      }
    }
    return Promise.reject(error);
  }
);

export default useHttp;