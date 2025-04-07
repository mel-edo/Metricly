import { publicRequest } from './api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

// Login function
const login = async (credentials: LoginCredentials): Promise<string> => {
  const response = await publicRequest('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  
  // Store the token in localStorage
  if (response.token) {
    localStorage.setItem('token', response.token);
    return response.token;
  }
  
  throw new Error('Login failed: No token received');
};

// Logout function
const logout = (): void => {
  localStorage.removeItem('token');
};

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

// Register function
const register = async (credentials: LoginCredentials): Promise<void> => {
  await publicRequest('/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// Change password function
const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  await fetch(`${import.meta.env.VITE_API_URL}/api/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    return response.json();
  });
};

export { login, logout, isAuthenticated, register, changePassword };
