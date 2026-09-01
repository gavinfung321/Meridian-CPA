import { Button } from "../../../../components/ui/button";
import { Language, translations } from "../../../../lib/translations";

interface HeroSectionProps {
  lang: Language;
  onBrowseSessionsClick: () => void;
}

export const HeroSection = ({ lang, onBrowseSessionsClick }: HeroSectionProps): JSX.Element => {
  const t = translations[lang].hero;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex h-screen min-h-[100svh] sm:min-h-[700px] w-full items-end overflow-hidden px-6 sm:px-12 lg:px-[50px] pb-12 sm:pb-[70px] pt-[25px] text-white animate-fade-in"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/hero.png')",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.25) 100%)",
        }}
      />
      <div className="relative flex w-full max-w-[1180px] flex-col items-start gap-6">
        <h1
          id="hero-title"
          className="text-[clamp(1.75rem,4vw,3.25rem)] font-bold leading-[1.15] tracking-tight max-w-4xl"
        >
          {t.title}
        </h1>
        <p className="text-[clamp(1rem,1.8vw,1.25rem)] font-medium leading-snug max-w-[560px] text-white/95">
          {t.subtitle}
        </p>
        <Button
          type="button"
          onClick={onBrowseSessionsClick}
          className="h-auto rounded-full bg-white hover:bg-[#0F2A1D] hover:text-white hover:scale-[1.03] text-[#0F2A1D] px-8 py-4 text-[15px] font-semibold transition-all duration-200"
        >
          {t.btn}
        </Button>
      </div>
    </section>
  );
};
