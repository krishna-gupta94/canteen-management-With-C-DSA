export type Role = 'student' | 'ROLE_ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  role?: string;
  student?: {
    id: number;
    name: string;
    email: string;
  };
  student_id?: number;
}
