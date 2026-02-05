export type UpdatePasswordResponse = {
  message: string;
};

export type UpdateEmailResponse = {
  message: string;
  user?: import('./auth.model').User;
};

