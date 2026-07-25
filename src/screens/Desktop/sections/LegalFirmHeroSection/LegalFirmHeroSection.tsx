import { useEffect, useRef } from "react";

export const LegalFirmHeroSection = (): JSX.Element => {
  const bgRef = useRef<HTMLDivElement>(null);

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
      className="relative flex h-screen min-h-[700px] w-full items-end overflow-hidden px-[50px] pb-[70px] pt-[25px] text-white"
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
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.10) 100%)",
        }}
      />
      <div className="relative flex w-full flex-col gap-10">
        <h1
          id="hero-title"
          className="text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[1.1] tracking-tight max-w-4xl"
        >
          Statutory Audits &amp; Corporate Advisory for Hong Kong Enterprises
        </h1>
        <div className="flex w-full items-end justify-between gap-8 flex-wrap">
          <p className="text-[clamp(1rem,2vw,1.35rem)] font-medium leading-snug max-w-[520px]">
            Trusted expertise in audit, tax, and corporate advisory — serving Hong Kong businesses since 2005.
          </p>
          <p className="text-[0.95rem] leading-relaxed max-w-[360px] text-white/80">
            We partner with companies across Hong Kong and the Greater Bay Area to deliver rigorous statutory compliance and strategic financial insight.
          </p>
        </div>
      </div>
    </section>
  );
};
