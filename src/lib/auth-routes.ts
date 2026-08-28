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
