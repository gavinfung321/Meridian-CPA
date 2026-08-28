export type UserRole = "admin" | "client" | "user";
export type UserStatus = "active" | "banned";

export interface Profile {
  id: string;
  updated_at: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_prefix: string | null;
  phone_number: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  county: string | null;
  post_code: string | null;
  country: string | null;
  avatar_path: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          updated_at?: string | null;
          first_name: string;
          last_name: string;
          full_name: string;
          email: string;
          phone_prefix?: string | null;
          phone_number?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          county?: string | null;
          post_code?: string | null;
          country?: string | null;
          avatar_path?: string | null;
          role?: UserRole;
          status?: UserStatus;
          created_at?: string;
        };
        Update: {
          updated_at?: string | null;
          first_name?: string;
          last_name?: string;
          full_name?: string;
          email?: string;
          phone_prefix?: string | null;
          phone_number?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          county?: string | null;
          post_code?: string | null;
          country?: string | null;
          avatar_path?: string | null;
          role?: UserRole;
          status?: UserStatus;
        };
        Relationships: [];
      };
    };
    Enums: {
      user_role: UserRole;
      user_status: UserStatus;
    };
  };
}
