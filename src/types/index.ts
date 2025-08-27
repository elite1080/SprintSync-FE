export interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  total_minutes: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeLog {
  total_log_count: string;
  total_minutes: number;
  date: string;
  users: UserTimeLog[];
}

export interface UserTimeLog {
  user_id: string;
  username: string;
  minutes: number;
  log_count: number;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface AISuggestion {
  type: 'task_description' | 'daily_plan';
  content: string;
  confidence: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
