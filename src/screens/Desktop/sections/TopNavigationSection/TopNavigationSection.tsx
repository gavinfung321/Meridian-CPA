import { Language, translations } from "../../../../lib/translations";

const AccountingLogo = () => (
  <svg width="140" height="36" viewBox="0 0 140 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Meridian CPA logo">
    <rect x="2" y="18" width="7" height="14" rx="1.5" fill="#a3c9b8" />
    <rect x="12" y="11" width="7" height="21" rx="1.5" fill="#a3c9b8" />
    <rect x="22" y="5" width="7" height="27" rx="1.5" fill="#a3c9b8" />
    <path d="M25.5 2L29 5.5L25.5 9" stroke="#a3c9b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <text x="36" y="24" fontFamily="'Geist', 'Inter', Helvetica, sans-serif" fontSize="15" fontWeight="700" fill="#ffffff" letterSpacing="-0.3">
      Meridian
    </text>
    <text x="103" y="24" fontFamily="'Geist', 'Inter', Helvetica, sans-serif" fontSize="15" fontWeight="400" fill="#a3c9b8" letterSpacing="-0.2">
      CPA
    </text>
  </svg>
);

interface TopNavigationProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

export const TopNavigationSection = ({ lang, setLang }: TopNavigationProps): JSX.Element => {
  const t = translations[lang].nav;

  const navigationItems = [
    { label: t.services, href: "#services" },
    { label: t.bookConsult, href: "#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 flex w-full items-center bg-[#0f2a1d]/90 backdrop-blur-sm px-[50px] py-4 border-b border-white/10">
      <a href="/" aria-label="Meridian CPA Home" className="flex shrink-0 items-center">
        <AccountingLogo />
      </a>
      <nav className="ml-auto flex items-center gap-8">
        {navigationItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="text-[13px] font-normal text-white/80 hover:text-white transition-colors duration-150 whitespace-nowrap tracking-[-0.02em]"
          >
            {item.label}
          </a>
        ))}
        {/* Language Switcher */}
        <div className="flex items-center gap-2 border-l border-white/20 pl-6 text-[13px] font-medium text-white/60">
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
    </header>
  );
};
