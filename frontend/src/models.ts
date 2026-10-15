export type Role = {
  id: string;
  name: string;
  isAdmin: boolean;
  canManageCategories: boolean;
  _count?: { users: number };
};
export type Category = {
  id: string;
  name: string;
  description: string;
  _count?: { users: number };
};
export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: Role;
  categories: Category[];
};
export type Directory = {
  users: User[];
  roles: Role[];
  categories: Category[];
};
