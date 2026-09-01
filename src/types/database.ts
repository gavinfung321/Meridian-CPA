export type UserRole = "admin" | "client" | "user";
export type UserStatus = "active" | "banned";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "rejected";

export interface Profile {
  id: string;
  updated_at: string | null;
  first_name: string;
  last_name: string;
  full_name?: string | null;
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface SessionType {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  default_duration_minutes: number;
  default_price: number;
  default_max_slots: number;
  is_active: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  title: string;
  description: string | null;
  type: string;
  session_type_id: string | null;
  location: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  max_slots: number;
  price: number;
  recurrence_rules: Record<string, unknown> | null;
  image_path: string | null;
  is_cancelled: boolean;
  cancel_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  session_id: string;
  user_id: string;
  status: BookingStatus;
  cancel_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
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
          full_name?: string | null;
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
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      session_types: {
        Row: SessionType;
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description?: string | null;
          default_duration_minutes: number;
          default_price?: number;
          default_max_slots?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          category_id?: string;
          name?: string;
          description?: string | null;
          default_duration_minutes?: number;
          default_price?: number;
          default_max_slots?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      sessions: {
        Row: Session;
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type: string;
          session_type_id?: string | null;
          location: string;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          max_slots?: number;
          price?: number;
          recurrence_rules?: Record<string, unknown> | null;
          image_path?: string | null;
          is_cancelled?: boolean;
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          type?: string;
          session_type_id?: string | null;
          location?: string;
          start_time?: string;
          end_time?: string;
          duration_minutes?: number;
          max_slots?: number;
          price?: number;
          recurrence_rules?: Record<string, unknown> | null;
          image_path?: string | null;
          is_cancelled?: boolean;
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: Booking;
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          status?: BookingStatus;
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          session_id?: string;
          user_id?: string;
          status?: BookingStatus;
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Enums: {
      user_role: UserRole;
      user_status: UserStatus;
      booking_status: BookingStatus;
    };
  };
}
