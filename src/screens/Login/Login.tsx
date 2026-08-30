import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { MeridianLogo } from "../../components/MeridianLogo";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useAuth } from "../../contexts/AuthContext";
import { getPostLoginRoute } from "../../lib/auth-routes";

export function Login(): JSX.Element {
  const { signIn, user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    (location.state as { message?: string } | null)?.message ?? null,
  );
  const [submitting, setSubmitting] = useState(false);

  const from =
    (location.state as { from?: string; bookSessionId?: string } | null)?.from ?? "/dashboard";
  const bookSessionId = (location.state as { bookSessionId?: string } | null)?.bookSessionId;

  useEffect(() => {
    document.title = "Sign in | Meridian CPA";
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute(
      "content",
      "Sign in to your Meridian CPA client dashboard to manage bookings and profile.",
    );
  }, []);

  if (!loading && user && profile) {
    const destination = getPostLoginRoute(from, profile.role);
    const dashboardPath = profile.role === "admin" ? "/admin/dashboard" : "/dashboard";
    return (
      <Navigate
        to={destination}
        replace
        state={bookSessionId && destination === dashboardPath ? { bookSessionId } : undefined}
      />
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signIn(email, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    navigate(getPostLoginRoute(from, result.profile?.role), {
      replace: true,
      state:
        bookSessionId && result.profile?.role !== "admin"
          ? { bookSessionId }
          : undefined,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F6] px-6 py-12 font-sans text-[#0F2A1D]">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link to="/">
            <MeridianLogo variant="dark" className="h-10 w-auto" />
          </Link>
        </div>

        <Card className="border-[#EDECE6] bg-white shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="font-serif text-3xl text-[#0F2A1D]">
              Welcome back
            </CardTitle>
            <CardDescription className="text-[#0F2A1D]/70">
              Sign in to access your Meridian CPA dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-md border border-[#EDECE6] bg-[#F9F9F6] px-3 py-2 text-sm outline-none ring-[#C9A84C] focus:ring-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-[#C9A84C] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-md border border-[#EDECE6] bg-[#F9F9F6] px-3 py-2 text-sm outline-none ring-[#C9A84C] focus:ring-2"
                />
              </div>

              {notice ? (
                <p className="rounded-md border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-3 py-2 text-sm">
                  {notice}
                </p>
              ) : null}

              {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
              >
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[#0F2A1D]/70">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-medium text-[#C9A84C] hover:underline">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
