import type { UserRole } from "../types/database";

export function getHomeRouteForRole(role: UserRole | undefined): string {
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
}

export function isAdminRole(role: UserRole | undefined): boolean {
  return role === "admin";
}

export function isDashboardUserRole(role: UserRole | undefined): boolean {
  return role === "user" || role === "client";
}

export function getPostLoginRoute(from: string, role: UserRole | undefined): string {
  const home = getHomeRouteForRole(role);
  if (isAdminRole(role) && from.startsWith("/admin")) return from;
  if (isDashboardUserRole(role) && from.startsWith("/dashboard")) return from;
  return home;
}

/** After login/signup — honour pending session booking from landing. */
export function getPostLoginBookDestination(
  from: string,
  role: UserRole | undefined,
  bookSessionId?: string | null,
): string {
  if (bookSessionId && isAdminRole(role)) {
    return "/admin/bookings";
  }
  if (bookSessionId && (isDashboardUserRole(role) || role == null)) {
    return `/dashboard/book?session=${encodeURIComponent(bookSessionId)}`;
  }
  return getPostLoginRoute(from, role);
}
