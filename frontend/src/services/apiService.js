import axios from 'axios';
import axiosRetry from 'axios-retry';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Configure automatic retries
axiosRetry(api, {
  retries: 3,
  retryCondition: (error) => {
    // Retry on network errors and 5xx status codes
    // We also retry on idempotent-safe errors
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response && error.response.status >= 500)
    );
  },
  retryDelay: axiosRetry.exponentialDelay,
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show toast if the request was cancelled or if skipToast is set
    if (axios.isCancel(error) || error.config?.skipToast)
      return Promise.reject(error);

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Ocurrió un error inesperado';

    // Show error toast automatically
    toast.error(
      error.response?.status === 401
        ? 'Sesión expirada'
        : 'Error en la solicitud',
      {
        description: message,
      },
    );

    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return Promise.reject(error);
  },
);

export const apiService = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),

  // Standardized wrappers with success notifications
  postWithNotify: async (url, data, successMsg, config, toastOptions) => {
    const res = await api.post(url, data, config);
    if (successMsg) toast.success(successMsg, toastOptions);
    return res;
  },

  patchWithNotify: async (url, data, successMsg, config, toastOptions) => {
    const res = await api.patch(url, data, config);
    if (successMsg) toast.success(successMsg, toastOptions);
    return res;
  },

  deleteWithNotify: async (url, successMsg, config, toastOptions) => {
    const res = await api.delete(url, config);
    if (successMsg) toast.success(successMsg, toastOptions);
    return res;
  },
};
