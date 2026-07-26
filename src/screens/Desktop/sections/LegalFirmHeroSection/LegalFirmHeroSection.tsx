import { useEffect, useRef } from "react";
import { Language, translations } from "../../../../lib/translations";

interface LegalFirmHeroProps {
  lang: Language;
}

export const LegalFirmHeroSection = ({ lang }: LegalFirmHeroProps): JSX.Element => {
  const bgRef = useRef<HTMLDivElement>(null);
  const t = translations[lang].hero;

  useEffect(() => {
    const handleScroll = () => {
      if (!bgRef.current) return;
      const scrollY = window.scrollY;
      bgRef.current.style.transform = `translateY(${scrollY * 0.45}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex h-screen min-h-[700px] w-full items-end overflow-hidden px-[50px] pb-[70px] pt-[25px] text-white animate-fade-in"
    >
      {/* parallax background */}
      <div
        ref={bgRef}
        className="absolute inset-0 -top-[20%] h-[140%] w-full bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: "url('/image copy.png')",
        }}
      />
      {/* gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(15,42,29,0.9) 0%, rgba(15,42,29,0.4) 55%, rgba(15,42,29,0.2) 100%)",
        }}
      />
      <div className="relative flex w-full flex-col gap-10">
        <h1
          id="hero-title"
          className="text-[clamp(2rem,5.5vw,4.5rem)] font-bold leading-[1.15] tracking-tight max-w-5xl"
        >
          {t.title}
        </h1>
        <div className="flex w-full items-end justify-between gap-8 flex-wrap">
          <p className="text-[clamp(1rem,1.8vw,1.25rem)] font-medium leading-snug max-w-[560px] text-white/95">
            {t.subtitle}
          </p>
          <p className="text-[0.95rem] leading-relaxed max-w-[360px] text-white/80">
            {t.description}
          </p>
        </div>
      </div>
    </section>
  );
};
