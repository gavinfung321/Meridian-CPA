import { LegalFirmFooterSection } from "./sections/LegalFirmFooterSection/LegalFirmFooterSection";
import { LegalFirmHeroSection } from "./sections/LegalFirmHeroSection";
import { LegalServicesContentSection } from "./sections/LegalServicesContentSection/LegalServicesContentSection";
import { TopNavigationSection } from "./sections/TopNavigationSection/TopNavigationSection";

export const Desktop = (): JSX.Element => {
  return (
    <main className="flex min-h-screen w-full flex-col overflow-x-hidden bg-displaydisplay-2">
      <TopNavigationSection />
      <LegalFirmHeroSection />
      <LegalServicesContentSection />
      <LegalFirmFooterSection />
    </main>
  );
};
