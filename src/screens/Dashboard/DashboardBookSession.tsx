import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { PublicSessionCatalog } from "../../components/PublicSessionCatalog";
import { DashboardLayout } from "../../components/DashboardLayout";
import {
  getStoredLanguage,
  localeForLanguage,
} from "../../lib/language-preference";
import {
  clearPendingBookSessionId,
  getPendingBookSessionId,
} from "../../lib/pending-book-session";
import { translations } from "../../lib/translations";

export function DashboardBookSession(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const lang = getStoredLanguage();
  const locale = localeForLanguage(lang);
  const t = translations[lang].booking;

  const sessionIdFromUrl = useMemo(() => {
    const fromQuery = searchParams.get("session");
    if (fromQuery) return fromQuery;

    const fromState = (location.state as { bookSessionId?: string } | null)?.bookSessionId;
    if (fromState) return fromState;

    return getPendingBookSessionId();
  }, [searchParams, location.state]);

  useEffect(() => {
    document.title = `${t.portal.pageTitle} | Meridian CPA`;
  }, [t.portal.pageTitle]);

  useEffect(() => {
    if (!sessionIdFromUrl) return;
    if (searchParams.get("session") === sessionIdFromUrl) return;

    setSearchParams(
      (params) => {
        params.set("session", sessionIdFromUrl);
        return params;
      },
      { replace: true, state: {} },
    );
  }, [sessionIdFromUrl, searchParams, setSearchParams]);

  const handleOpenSessionChange = useCallback(
    (sessionId: string | null) => {
      setSearchParams(
        (params) => {
          if (sessionId) {
            params.set("session", sessionId);
          } else {
            params.delete("session");
            clearPendingBookSessionId();
          }
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">{t.portal.pageTitle}</h1>
          <p className="mt-2 text-[#0F2A1D]/70">{t.portal.pageSubtitle}</p>
        </div>

        <PublicSessionCatalog
          lang={lang}
          locale={locale}
          variant="portal"
          openSessionId={sessionIdFromUrl}
          onOpenSessionChange={handleOpenSessionChange}
        />
      </div>
    </DashboardLayout>
  );
}
