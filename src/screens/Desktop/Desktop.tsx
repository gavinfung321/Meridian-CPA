import { useState } from "react";
import { ContactModal } from "../../components/ContactModal";
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
  const openContact = () => setContactOpen(true);
  const closeContact = () => setContactOpen(false);

  return (
    <main
      id="main"
      className="flex min-h-screen w-full flex-col overflow-x-hidden bg-displaydisplay-2"
    >
      <TopNavigationSection lang={lang} setLang={setLang} onContactClick={openContact} />
      <HeroSection lang={lang} onBookNowClick={openContact} />
      <MainContentSection lang={lang} onContactClick={openContact} />
      <FooterSection lang={lang} />
      <ContactModal lang={lang} open={contactOpen} onClose={closeContact} />
    </main>
  );
};
