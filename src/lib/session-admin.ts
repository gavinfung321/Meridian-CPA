import { supabase } from "./supabase";
import type { Category, SessionType } from "../types/database";

export const adminInputClassName =
  "w-full rounded-md border border-[#EDECE6] bg-[#F9F9F6] px-3 py-2 text-sm outline-none ring-[#C9A84C] focus:ring-2";

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-HK", {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSessionSchedule(startTime: string): string {
  return new Intl.DateTimeFormat("en-HK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(startTime));
}

export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type SessionTypeWithCategory = SessionType & {
  category: Category | null;
};

export async function fetchSessionTypesWithCategories(): Promise<SessionTypeWithCategory[]> {
  const { data, error } = await supabase
    .from("session_types")
    .select("*, category:categories(*)")
    .order("name");

  if (error) throw error;
  return (data ?? []) as SessionTypeWithCategory[];
}

export function countActiveBookings(
  bookings: Array<{ status: string }> | null | undefined,
): number {
  return (bookings ?? []).filter(
    (booking) => booking.status === "pending" || booking.status === "confirmed",
  ).length;
}
