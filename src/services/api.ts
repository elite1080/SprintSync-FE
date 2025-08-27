import axios from 'axios';
import { User, Task, AISuggestion, AuthResponse } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { username, password });
    return response.data;
  },
  
  register: async (email: string, password: string, username: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', { email, password, username });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },
  
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<{ users: User[] }>('/users');
    return response.data.users;
  }
};

export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get<{ tasks: Task[], message: string, isEmpty: boolean }>('/tasks');
    return response.data.tasks;
  },
  
  getTask: async (id: string): Promise<Task> => {
    const response = await api.get<{ task: Task }>(`/tasks/${id}`);
    return response.data.task;
  },
  
  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Task> => {
    const response = await api.post<{ message: string, task: Task }>('/tasks', task);
    return response.data.task;
  },
  
  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const response = await api.put<{ message: string, task: Task }>(`/tasks/${id}`, updates);
    return response.data.task;
  },
  
  deleteTask: async (id: string): Promise<void> => {
    await api.delete<{ message: string }>(`/tasks/${id}`);
    // Success response, no need to check for errors
  },
  
  updateTaskStatus: async (id: string, status: Task['status']): Promise<Task> => {
    const response = await api.patch<{ message: string, task: Task }>(`/tasks/${id}/status`, { status });
    return response.data.task;
  }
};

export const aiService = {
  getSuggestion: async (type: 'task_description' | 'daily_plan', input: string): Promise<AISuggestion> => {
    if (type === 'daily_plan') {
      const response = await api.get<{ plan: string, isStub: boolean, taskCount: number, message: string }>('/ai/daily-plan');
      return {
        type: 'daily_plan',
        content: response.data.plan,
        confidence: response.data.isStub ? 0.5 : 0.9
      };
    } else {
      const response = await api.post<{ title: string, description: string, isStub: boolean, message: string }>('/ai/suggest', { title: input });
      return {
        type: 'task_description',
        content: response.data.description,
        confidence: response.data.isStub ? 0.5 : 0.9
      };
    }
  }
};

export default api;
