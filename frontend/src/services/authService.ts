import api from './api';
import { LoginRequest, LoginResponse, User } from '../types/User';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(userData: Partial<User> & { password: string }): Promise<User> {
    const response = await api.post<User>('/auth/register', userData);
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  async updateProfile(userId: number, profileData: Partial<User>): Promise<User> {
    const response = await api.put<User>(`/users/${userId}`, profileData);
    return response.data;
  },

  async fetchUserProfile(userId: number): Promise<User> {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  }
};