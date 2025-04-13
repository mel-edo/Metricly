import { publicRequest, authenticatedRequest } from './api';

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
  await authenticatedRequest('/change-password', {
    method: 'POST',
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });
};

// Change username function
const changeUsername = async (newUsername: string): Promise<void> => {
  const data = await authenticatedRequest('/change-username', {
    method: 'POST',
    body: JSON.stringify({
      new_username: newUsername,
    }),
  });

  // Update the token in localStorage
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
};

export { login, logout, isAuthenticated, register, changePassword, changeUsername };
