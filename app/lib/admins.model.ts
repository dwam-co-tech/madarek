export type AdminUserDTO = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  role: string;
};

export type PageLink = {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
};

export type PaginatedResponse<T> = {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PageLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
};

export type GetUsersResponse = PaginatedResponse<AdminUserDTO>;

export type AddUserPayload = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export type UpdateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export type AddUserResponse = {
  message?: string;
  user?: AdminUserDTO;
} | AdminUserDTO;

export type UpdateUserResponse = {
  message?: string;
  user?: AdminUserDTO;
} | AdminUserDTO;

export type DeleteUserResponse = {
  message?: string;
};
