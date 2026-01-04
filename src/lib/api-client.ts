import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For HTTP-Only cookies
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Inject Organization ID from local storage or state if available
    // Note: In a real app, you might use a store or context to get this.
    // Ideally, for SSR/Server Components, this logic differs (cookies/headers passed from server).
    // This client is primarily for Client Components.
    
    if (typeof window !== 'undefined') {
        const orgId = localStorage.getItem('x-org-id');
        if (orgId) {
            config.headers['x-org-id'] = orgId;
        }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (for token refresh would go here)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401/Refresh Token logic here
    return Promise.reject(error);
  }
);
