// Base API configuration
const API_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // If token is expired, clear it from localStorage and dispatch event
    if (response.status === 401 && (errorData.error?.includes('Token expired') || errorData.error?.includes('Invalid token'))) {
      console.warn('Authentication token expired or invalid');
      localStorage.removeItem('token');

      // Dispatch a custom event to notify the app about token expiration
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('token-expired'));
      }
    }

    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  return response.json();
};

// Get the authentication token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// API request with authentication
const authenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  }).then(handleResponse);
};

// Public API request (no authentication)
const publicRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  }).then(handleResponse);
};

export { API_URL, authenticatedRequest, publicRequest, getToken };
