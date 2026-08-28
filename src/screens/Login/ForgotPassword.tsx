import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const inputClassName =
  "w-full rounded-md border border-[#EDECE6] bg-[#F9F9F6] px-3 py-2 text-sm outline-none ring-[#C9A84C] focus:ring-2";

export function ForgotPassword(): JSX.Element {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Reset password | Meridian CPA";
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await resetPassword(email);
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
              Reset your password
            </CardTitle>
            <CardDescription className="text-[#0F2A1D]/70">
              Enter your email and we&apos;ll send you a link to choose a new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4 text-center">
                <p className="rounded-md border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-3 text-sm">
                  If an account exists for {email}, a reset link has been sent. Check your inbox.
                </p>
                <Button asChild className="w-full bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90">
                  <Link to="/login">Back to sign in</Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
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
                  {submitting ? "Sending link..." : "Send reset link"}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-[#0F2A1D]/70">
              Remember your password?{" "}
              <Link to="/login" className="font-medium text-[#C9A84C] hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
