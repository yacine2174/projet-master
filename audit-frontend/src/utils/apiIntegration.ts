import React from 'react';
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { useNotificationHelper } from './notificationHelper';

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

class ApiClient {
  private client: AxiosInstance;
  private config: ApiConfig;
  private notifications: any;

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setNotifications(notifications: any) {
    this.notifications = notifications;
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp
        config.metadata = { startTime: new Date() };
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful requests
        const duration = new Date().getTime() - response.config.metadata?.startTime?.getTime();
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
        
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        // Log failed requests
        console.error(`❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - ${error.response?.status}`, error.response?.data);

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
          if (this.notifications) {
            this.notifications.notifyError(
              'Accès refusé',
              'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.'
            );
          }
          return Promise.reject(error);
        }

        // Handle 404 Not Found
        if (error.response?.status === 404) {
          if (this.notifications) {
            this.notifications.notifyError(
              'Ressource non trouvée',
              'La ressource demandée n\'existe pas ou a été supprimée.'
            );
          }
          return Promise.reject(error);
        }

        // Handle 500 Server Error
        if (error.response?.status >= 500) {
          if (this.notifications) {
            this.notifications.notifyError(
              'Erreur serveur',
              'Une erreur interne du serveur s\'est produite. Veuillez réessayer plus tard.'
            );
          }
          return Promise.reject(error);
        }

        // Handle network errors
        if (!error.response) {
          if (this.notifications) {
            this.notifications.notifyError(
              'Erreur de connexion',
              'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
              {
                label: 'Réessayer',
                onClick: () => window.location.reload()
              }
            );
          }
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );
  }

  private async retryRequest<T>(requestFn: () => Promise<AxiosResponse<T>>, attempt: number = 1): Promise<AxiosResponse<T>> {
    try {
      return await requestFn();
    } catch (error: any) {
      if (attempt < this.config.retryAttempts! && this.shouldRetry(error)) {
        console.log(`🔄 Tentative ${attempt + 1}/${this.config.retryAttempts}...`);
        await this.delay(this.config.retryDelay! * attempt);
        return this.retryRequest(requestFn, attempt + 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generic HTTP methods
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.retryRequest(() => 
        this.client.get<T>(url, { params })
      );
      return {
        data: response.data,
        success: true
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.retryRequest(() => 
        this.client.post<T>(url, data)
      );
      return {
        data: response.data,
        success: true
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.retryRequest(() => 
        this.client.put<T>(url, data)
      );
      return {
        data: response.data,
        success: true
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.retryRequest(() => 
        this.client.patch<T>(url, data)
      );
      return {
        data: response.data,
        success: true
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.retryRequest(() => 
        this.client.delete<T>(url)
      );
      return {
        data: response.data,
        success: true
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // File upload method
  async uploadFile<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.client.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return {
        data: response.data,
        success: true
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse {
    const apiError: ApiError = {
      message: 'Une erreur inattendue s\'est produite',
      status: error.response?.status,
      code: error.code,
      details: error.response?.data
    };

    if (error.response?.data?.message) {
      apiError.message = error.response.data.message;
    } else if (error.message) {
      apiError.message = error.message;
    }

    return {
      data: null,
      success: false,
      message: apiError.message,
      errors: error.response?.data?.errors || [apiError.message]
    };
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Connection test method
  async testConnection(): Promise<{ connected: boolean; latency?: number; error?: string }> {
    const startTime = Date.now();
    try {
      await this.client.get('/ping');
      const latency = Date.now() - startTime;
      return { connected: true, latency };
    } catch (error: any) {
      return { 
        connected: false, 
        error: error.message || 'Impossible de se connecter au serveur'
      };
    }
  }
}

// Create API client instance
export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 15000,
  retryAttempts: 3,
  retryDelay: 1000
});

// Hook for using API client with notifications
export const useApiClient = () => {
  const notifications = useNotificationHelper();
  
  React.useEffect(() => {
    apiClient.setNotifications(notifications);
  }, [notifications]);

  return apiClient;
};

// Enhanced API methods with better error handling
export const enhancedApi = {
  // Audit operations
  audits: {
    getAll: () => apiClient.get('/audits'),
    getById: (id: string) => apiClient.get(`/audits/${id}`),
    create: (data: any) => apiClient.post('/audits', data),
    update: (id: string, data: any) => apiClient.put(`/audits/${id}`, data),
    delete: (id: string) => apiClient.delete(`/audits/${id}`),
    updateStatus: (id: string, status: string) => apiClient.patch(`/audits/${id}/status`, { status })
  },

  // Project operations
  projects: {
    getAll: () => apiClient.get('/projects'),
    getById: (id: string) => apiClient.get(`/projects/${id}`),
    create: (data: any) => apiClient.post('/projects', data),
    update: (id: string, data: any) => apiClient.put(`/projects/${id}`, data),
    delete: (id: string) => apiClient.delete(`/projects/${id}`)
  },

  // File operations
  files: {
    upload: (file: File, onProgress?: (progress: number) => void) => 
      apiClient.uploadFile('/files/upload', file, onProgress),
    download: (id: string) => apiClient.get(`/files/${id}/download`),
    delete: (id: string) => apiClient.delete(`/files/${id}`)
  },

  // System operations
  system: {
    healthCheck: () => apiClient.healthCheck(),
    testConnection: () => apiClient.testConnection(),
    getVersion: () => apiClient.get('/version')
  }
};

// Utility functions
export const apiUtils = {
  // Check if response is successful
  isSuccess: (response: ApiResponse): boolean => {
    return response.success === true;
  },

  // Extract error message from response
  getErrorMessage: (response: ApiResponse): string => {
    if (response.message) return response.message;
    if (response.errors && response.errors.length > 0) {
      return response.errors.join(', ');
    }
    return 'Une erreur inattendue s\'est produite';
  },

  // Handle API response with notifications
  handleResponse: (response: ApiResponse, notifications: any, successMessage?: string) => {
    if (apiUtils.isSuccess(response)) {
      if (successMessage && notifications) {
        notifications.notifySuccess('Succès', successMessage);
      }
      return response.data;
    } else {
      const errorMessage = apiUtils.getErrorMessage(response);
      if (notifications) {
        notifications.notifyError('Erreur', errorMessage);
      }
      throw new Error(errorMessage);
    }
  }
};
