import apiClient from './client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  responseCode: number;
  responseDescription: string;
  responseData?: any;
}

export interface User {
  username: string;
  password: string;
}

export const authApi = {
  // Register a new user
  register: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/transformer-thermal-inspection/login/save',
      credentials
    );
    return response.data;
  },

  // Verify credentials (login)
  verifyCredentials: async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/transformer-thermal-inspection/login/verify',
      credentials
    );
    return response.data;
  },
};
