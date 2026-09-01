import { supabase } from "./supabase";
import { fetchBookingAppSettings, getMaxBookableCutoff } from "./app-settings";
import { getPublicSessionImageUrl } from "./session-image";
import { countActiveBookings } from "./session-admin";
import type {
  SessionLocationFilter,
  SessionTypeFilter,
} from "../screens/Desktop/sections/BookingSection/BookingFilters";

export interface PublicSessionCard {
  id: string;
  title: string;
  location: string;
  tags: string[];
  day: string;
  time: string;
  duration: number;
  capacity: { booked: number; total: number };
  isPrivate: boolean;
  typeFilter: SessionTypeFilter;
  locationFilter: SessionLocationFilter;
  imageUrl: string | null;
  price: number;
  sessionTypeName: string;
}

type SessionQueryRow = {
  id: string;
  title: string;
  location: string;
  start_time: string;
  duration_minutes: number;
  max_slots: number;
  type: string;
  price: number;
  image_path: string | null;
  session_type: {
    name: string;
    category: { name: string; slug: string } | null;
  } | null;
  bookings: Array<{ status: string }> | null;
};

const SLUG_TO_TYPE_FILTER: Record<string, SessionTypeFilter> = {
  "tax-planning": "taxPlanning",
  "audit-compliance": "auditCompliance",
  "payroll-mpf": "payrollMpf",
  advisory: "advisory",
};

function categorySlugToTypeFilter(slug: string | undefined): SessionTypeFilter {
  if (!slug) return "advisory";
  return SLUG_TO_TYPE_FILTER[slug] ?? "advisory";
}

function locationToFilter(location: string): SessionLocationFilter {
  const normalized = location.toLowerCase();
  if (normalized.includes("zoom") || normalized.includes("online") || normalized.includes("webinar")) {
    return "onlineZoom";
  }
  if (normalized.includes("client") || normalized.includes("site")) {
    return "clientSite";
  }
  return "centralOffice";
}

function formatDayTime(startTime: string, locale: string): { day: string; time: string } {
  const date = new Date(startTime);
  const day = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date);
  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return { day, time };
}

function mapSessionRow(row: SessionQueryRow, locale: string): PublicSessionCard {
  const booked = countActiveBookings(row.bookings);
  const total = row.max_slots;
  const categoryName = row.session_type?.category?.name;
  const typeName = row.session_type?.name ?? row.type;
  const tags = [typeName, categoryName].filter((tag): tag is string => Boolean(tag));
  const { day, time } = formatDayTime(row.start_time, locale);

  return {
    id: row.id,
    title: row.title,
    location: row.location,
    tags: tags.length > 0 ? tags : [row.type],
    day,
    time,
    duration: row.duration_minutes,
    capacity: { booked, total },
    isPrivate: total <= 1,
    typeFilter: categorySlugToTypeFilter(row.session_type?.category?.slug),
    locationFilter: locationToFilter(row.location),
    imageUrl: getPublicSessionImageUrl(row.image_path),
    price: Number(row.price) || 0,
    sessionTypeName: typeName,
  };
}

export async function fetchPublicSessions(locale = "en-HK"): Promise<PublicSessionCard[]> {
  const now = new Date().toISOString();
  const bookingSettings = await fetchBookingAppSettings();
  const maxStart = getMaxBookableCutoff(bookingSettings.max_booking_days_advance).toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .select(`
      id,
      title,
      location,
      start_time,
      duration_minutes,
      max_slots,
      type,
      price,
      image_path,
      session_type:session_types (
        name,
        category:categories (name, slug)
      ),
      bookings (status)
    `)
    .eq("is_cancelled", false)
    .gte("start_time", now)
    .lte("start_time", maxStart)
    .order("start_time", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as SessionQueryRow[]).map((row) => mapSessionRow(row, locale));
}
