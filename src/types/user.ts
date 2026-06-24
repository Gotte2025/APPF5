export type UserRole = "owner" | "player";

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  profile: Profile | null;
}
