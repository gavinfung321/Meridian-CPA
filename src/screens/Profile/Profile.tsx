import { Link } from "react-router-dom";
import { ProfilePageContent } from "../../components/ProfilePageContent";
import { useAuth } from "../../contexts/AuthContext";
import { getHomeRouteForRole } from "../../lib/auth-routes";

export function Profile(): JSX.Element {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-[#F9F9F6] font-sans text-[#0F2A1D]">
      <header className="border-b border-[#EDECE6] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="font-serif text-lg font-semibold text-[#0F2A1D]">
            Meridian CPA
          </Link>
          <Link
            to={getHomeRouteForRole(profile?.role)}
            className="text-sm font-medium text-[#C9A84C] hover:underline"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <ProfilePageContent
          idPrefix="profile"
          showPageTitle={false}
          wrapInDetailsCard
          showEmailNote
        />
      </main>
    </div>
  );
}
