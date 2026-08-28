import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { isAdminRole, isDashboardUserRole } from "../lib/auth-routes";

export type RouteAccess = "admin" | "dashboard";

interface ProtectedRouteProps {
  access: RouteAccess;
}

export function ProtectedRoute({ access }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9F6] font-sans text-[#0F2A1D]">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (profile?.status === "banned") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9F6] px-6 font-sans text-[#0F2A1D]">
        <div className="max-w-md rounded-xl border border-[#EDECE6] bg-white p-8 text-center shadow-sm">
          <h1 className="font-serif text-2xl font-semibold">Account suspended</h1>
          <p className="mt-3 text-sm text-[#0F2A1D]/70">
            Your account has been restricted. Please contact Meridian CPA support.
          </p>
        </div>
      </div>
    );
  }

  if (access === "admin") {
    if (!isAdminRole(profile?.role)) {
      return <Navigate to="/not-authorized" replace state={{ from: location.pathname }} />;
    }
  }

  if (access === "dashboard") {
    if (isAdminRole(profile?.role)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (!isDashboardUserRole(profile?.role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}
