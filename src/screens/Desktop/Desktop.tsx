import { useMemo, useState } from "react";
import { BookCallPreflightModal } from "../../components/BookCallPreflightModal";
import { ContactModal } from "../../components/ContactModal";
import { useAuth } from "../../contexts/AuthContext";
import { useCalendlyBooking } from "../../hooks/useCalendlyBooking";
import { getDisplayName } from "../../lib/profile";
import { Language } from "../../lib/translations";
import { FooterSection } from "./sections/FooterSection/FooterSection";
import { HeroSection } from "./sections/HeroSection";
import { MainContentSection } from "./sections/MainContentSection/MainContentSection";
import { TopNavigationSection } from "./sections/TopNavigationSection/TopNavigationSection";

interface DesktopProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Desktop = ({ lang, setLang }: DesktopProps): JSX.Element => {
  const [contactOpen, setContactOpen] = useState(false);
  const openContactFallback = () => setContactOpen(true);
  const closeContact = () => setContactOpen(false);

  const { user, profile } = useAuth();
  const {
    requestBookCall,
    preflightOpen,
    preflightUtm,
    cancelPreflight,
  } = useCalendlyBooking({
    onFallback: openContactFallback,
  });

  const prefillDefaults = useMemo(() => {
    const name = profile
      ? getDisplayName(profile.first_name, profile.last_name, profile.full_name)
      : "";
    const email = profile?.email ?? user?.email ?? "";
    return { name, email };
  }, [profile, user?.email]);

  return (
    <main
      id="main"
      className="flex min-h-screen w-full flex-col overflow-x-hidden bg-displaydisplay-2"
    >
      <TopNavigationSection
        lang={lang}
        setLang={setLang}
        onContactClick={() => requestBookCall("header-contact")}
      />
      <HeroSection
        lang={lang}
        onBookNowClick={() => requestBookCall("hero-book-now")}
      />
      <MainContentSection
        lang={lang}
        onServicesClick={() => requestBookCall("services-cta")}
        onBookingContactClick={() => requestBookCall("booking-banner")}
        onContactSectionClick={() => requestBookCall("contact-section")}
      />
      <FooterSection lang={lang} />
      <BookCallPreflightModal
        lang={lang}
        open={preflightOpen}
        utmContent={preflightUtm}
        onClose={cancelPreflight}
        initialName={prefillDefaults.name}
        initialEmail={prefillDefaults.email}
      />
      <ContactModal lang={lang} open={contactOpen} onClose={closeContact} />
    </main>
  );
};
