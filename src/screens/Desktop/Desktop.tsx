import { useState } from "react";
import { LegalFirmFooterSection } from "./sections/LegalFirmFooterSection/LegalFirmFooterSection";
import { LegalFirmHeroSection } from "./sections/LegalFirmHeroSection";
import { LegalServicesContentSection } from "./sections/LegalServicesContentSection/LegalServicesContentSection";
import { TopNavigationSection } from "./sections/TopNavigationSection/TopNavigationSection";
import { Language } from "../../lib/translations";

export const Desktop = (): JSX.Element => {
  const [lang, setLang] = useState<Language>("en");

  return (
    <main className="flex min-h-screen w-full flex-col overflow-x-hidden bg-displaydisplay-2">
      <TopNavigationSection lang={lang} setLang={setLang} />
      <LegalFirmHeroSection lang={lang} />
      <LegalServicesContentSection lang={lang} />
      <LegalFirmFooterSection lang={lang} />
    </main>
  );
};
