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

  // Login user - get all users
  getAllUsers: async (): Promise<AuthResponse> => {
    const response = await apiClient.get<AuthResponse>('/transformer-thermal-inspection/login/view');
    return response.data;
  },

  // Verify credentials (client-side check)
  verifyCredentials: async (
    credentials: LoginCredentials
  ): Promise<boolean> => {
    try {
      const response = await apiClient.get<AuthResponse>('/transformer-thermal-inspection/login/view');
      if (
        response.data.responseCode === 2000 &&
        response.data.responseData
      ) {
        const users = Array.isArray(response.data.responseData)
          ? response.data.responseData
          : [response.data.responseData];
        
        return users.some(
          (user: User) =>
            user.username === credentials.username &&
            user.password === credentials.password
        );
      }
      return false;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      return false;
    }
  },
};
