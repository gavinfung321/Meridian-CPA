import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { MeridianLogo } from "../../../../components/MeridianLogo";
import { Button } from "../../../../components/ui/button";
import { Language, translations } from "../../../../lib/translations";

interface TopNavigationProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onBookClick: () => void;
}

export const TopNavigationSection = ({ lang, setLang, onBookClick }: TopNavigationProps): JSX.Element => {
  const t = translations[lang].nav;
  const [menuOpen, setMenuOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const panelId = useId();

  const primaryLinks = [
    { label: t.about, href: "#about" },
    { label: t.services, href: "#services" },
    { label: t.auditCycle, href: "#process" },
    { label: t.ourTeam, href: "#partners" },
    { label: t.faq, href: "#faq" },
  ];

  useEffect(() => {
    const onScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * 0.65);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleBook = () => {
    closeMenu();
    onBookClick();
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-[#0f2a1d]/90 backdrop-blur-sm">
      <div className="flex w-full items-center px-4 sm:px-8 lg:px-[50px] py-3 lg:py-4">
        <Link to="/" aria-label="Meridian CPA Home" className="flex shrink-0 items-center" onClick={closeMenu}>
          <MeridianLogo variant="light" />
        </Link>

        <nav className="ml-auto hidden lg:flex items-center gap-3 xl:gap-6" aria-label="Primary">
          {primaryLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[12px] xl:text-[13px] font-normal text-white/80 hover:text-white transition-colors duration-150 whitespace-nowrap tracking-[-0.02em]"
            >
              {item.label}
            </a>
          ))}
          <Button
            type="button"
            onClick={onBookClick}
            className={`h-auto rounded-full px-4 py-2 text-[12px] xl:text-[13px] font-semibold shadow-none transition-all duration-200 hover:scale-[1.03] ${
              pastHero
                ? "bg-white text-[#0F2A1D] hover:bg-[#C9A84C] hover:text-[#0F2A1D]"
                : "border border-white/45 bg-transparent text-white hover:border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0F2A1D]"
            }`}
          >
            {t.bookConsult}
          </Button>
          <div className="flex items-center gap-2 border-l border-white/20 pl-4 xl:pl-6 text-[12px] xl:text-[13px] font-medium text-white/60">
            <button
              onClick={() => setLang("en")}
              className={`hover:text-white transition-colors ${lang === "en" ? "text-white font-bold" : ""}`}
              type="button"
            >
              EN
            </button>
            <span>/</span>
            <button
              onClick={() => setLang("zh")}
              className={`hover:text-white transition-colors ${lang === "zh" ? "text-white font-bold" : ""}`}
              type="button"
            >
              繁
            </button>
          </div>
        </nav>

        <div className="ml-auto flex lg:hidden items-center gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-white"
            aria-expanded={menuOpen}
            aria-controls={panelId}
            aria-label={menuOpen ? t.menuClose : t.menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-[57px] z-40 bg-black/40 lg:hidden"
            aria-label={t.menuClose}
            onClick={closeMenu}
          />
          <nav
            id={panelId}
            aria-label="Mobile"
            className="relative z-50 flex flex-col gap-1 border-t border-white/10 bg-[#0f2a1d] px-4 pb-6 pt-3 lg:hidden"
          >
            {primaryLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="py-3 text-[15px] font-medium text-white/90 hover:text-white border-b border-white/10"
              >
                {item.label}
              </a>
            ))}
            <Button
              type="button"
              onClick={handleBook}
              className="mt-4 h-auto w-full rounded-full bg-white text-[#0F2A1D] px-4 py-3 text-[14px] font-semibold shadow-none transition-all duration-200 hover:bg-[#C9A84C] hover:text-[#0F2A1D]"
            >
              {t.bookConsult}
            </Button>
            <div className="mt-4 flex items-center gap-2 text-[14px] font-medium text-white/60">
              <button
                onClick={() => setLang("en")}
                className={`hover:text-white transition-colors ${lang === "en" ? "text-white font-bold" : ""}`}
                type="button"
              >
                EN
              </button>
              <span>/</span>
              <button
                onClick={() => setLang("zh")}
                className={`hover:text-white transition-colors ${lang === "zh" ? "text-white font-bold" : ""}`}
                type="button"
              >
                繁
              </button>
            </div>
          </nav>
        </>
      )}
    </header>
  );
};
