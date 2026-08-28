import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MeridianLogo } from "../../components/MeridianLogo";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { getHomeRouteForRole } from "../../lib/auth-routes";

export function NotAuthorized(): JSX.Element {
  const { profile } = useAuth();
  const homeRoute = getHomeRouteForRole(profile?.role);

  useEffect(() => {
    document.title = "Not authorized | Meridian CPA";
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F6] px-6 py-12 font-sans text-[#0F2A1D]">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Link to="/">
            <MeridianLogo variant="dark" className="h-10 w-auto" />
          </Link>
        </div>

        <div className="rounded-xl border border-[#EDECE6] bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wider text-[#C9A84C]">
            Access denied
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-[#0F2A1D]">
            Not authorized
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#0F2A1D]/70">
            You don&apos;t have permission to view the admin area. This section is
            restricted to Meridian CPA administrators.
          </p>

          <Button
            asChild
            className="mt-8 w-full bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
          >
            <Link to={homeRoute}>Go to my dashboard</Link>
          </Button>

          <p className="mt-6 text-sm text-[#0F2A1D]/60">
            Need help?{" "}
            <Link to="/" className="font-medium text-[#C9A84C] hover:underline">
              Return to homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
