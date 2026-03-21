import axios from 'axios';
import axiosRetry from 'axios-retry';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Configure automatic retries
axiosRetry(api, {
  retries: 3,
  retryCondition: (error) => {
    // Retry on network errors and 5xx status codes
    // We also retry on idempotent-safe errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response && error.response.status >= 500);
  },
  retryDelay: axiosRetry.exponentialDelay,
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show toast if the request was cancelled
    if (axios.isCancel(error)) return Promise.reject(error);

    const message = error.response?.data?.detail || 
                    error.response?.data?.message || 
                    error.message || 
                    'Ocurrió un error inesperado';
    
    // Show error toast automatically
    toast.error('Error en la solicitud', {
      description: message,
    });

    return Promise.reject(error);
  }
);

const apiService = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
  
  // Standardized wrappers with success notifications
  postWithNotify: async (url, data, successMsg, config) => {
    const res = await api.post(url, data, config);
    if (successMsg) toast.success(successMsg);
    return res;
  },
  
  patchWithNotify: async (url, data, successMsg, config) => {
    const res = await api.patch(url, data, config);
    if (successMsg) toast.success(successMsg);
    return res;
  },
  
  deleteWithNotify: async (url, successMsg, config) => {
    const res = await api.delete(url, config);
    if (successMsg) toast.success(successMsg);
    return res;
  }
};

export { apiService };
