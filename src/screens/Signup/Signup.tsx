import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
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
import { getPostLoginBookDestination } from "../../lib/auth-routes";
import { getPendingBookSessionId } from "../../lib/pending-book-session";

const inputClassName =
  "w-full rounded-md border border-[#EDECE6] bg-[#F9F9F6] px-3 py-2 text-sm outline-none ring-[#C9A84C] focus:ring-2";

type SignupLocationState = {
  from?: string;
  bookSessionId?: string;
};

export function Signup(): JSX.Element {
  const { signUp, user, profile, loading } = useAuth();
  const location = useLocation();
  const authState = (location.state as SignupLocationState | null) ?? {};
  const from = authState.from ?? "/dashboard";
  const bookSessionId = authState.bookSessionId ?? getPendingBookSessionId() ?? undefined;
  const postLoginState = bookSessionId ? { bookSessionId } : undefined;

  const loginState = { from, bookSessionId };

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Create account | Meridian CPA";
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute(
      "content",
      "Create your Meridian CPA account to book sessions and manage your profile.",
    );
  }, []);

  if (!loading && user && profile) {
    return (
      <Navigate
        to={getPostLoginBookDestination(from, profile.role, bookSessionId)}
        replace
        state={postLoginState}
      />
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signUp(email, password, firstName, lastName);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
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
              Create your account
            </CardTitle>
            <CardDescription className="text-[#0F2A1D]/70">
              Register to book sessions and manage your Meridian CPA profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4 text-center">
                <p className="rounded-md border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-3 text-sm">
                  Account created. Check your email to confirm your address, then sign in.
                </p>
                <Button asChild className="w-full bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90">
                  <Link to="/login" state={loginState}>
                    Go to sign in
                  </Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      className={inputClassName}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      className={inputClassName}
                    />
                  </div>
                </div>

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
                    className={inputClassName}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClassName}
                  />
                </div>

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
                  {submitting ? "Creating account..." : "Create account"}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-[#0F2A1D]/70">
              Already have an account?{" "}
              <Link
                to="/login"
                state={loginState}
                className="font-medium text-[#C9A84C] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
