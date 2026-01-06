export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type LogoutResponse = {
  message: string;
};
