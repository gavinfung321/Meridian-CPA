import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { MIN_PASSWORD_LENGTH, validatePasswordLength } from "../../lib/password-policy";
import { supabase } from "../../lib/supabase";

const inputClassName =
  "w-full rounded-md border border-[#EDECE6] bg-[#F9F9F6] px-3 py-2 text-sm outline-none ring-[#C9A84C] focus:ring-2";

export function ResetPassword(): JSX.Element {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.title = "Choose new password | Meridian CPA";

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const passwordError = validatePasswordLength(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const result = await updatePassword(password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    navigate("/login", {
      replace: true,
      state: { message: "Password updated. Sign in with your new password." },
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
              Choose a new password
            </CardTitle>
            <CardDescription className="text-[#0F2A1D]/70">
              Enter and confirm your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!ready ? (
              <div className="space-y-4 text-center text-sm text-[#0F2A1D]/70">
                <p>This reset link is invalid or has expired.</p>
                <Button asChild className="w-full bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90">
                  <Link to="/forgot-password">Request a new link</Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-medium">
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
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
                  {submitting ? "Updating..." : "Update password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
