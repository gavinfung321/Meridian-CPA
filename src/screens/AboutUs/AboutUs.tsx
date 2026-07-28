import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MeridianLogo } from "../../components/MeridianLogo";
import { Language, translations } from "../../lib/translations";

interface AboutUsProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

export const AboutUs = ({ lang, setLang }: AboutUsProps): JSX.Element => {
  const t = translations[lang].aboutPage;

  useEffect(() => {
    document.title =
      lang === "zh"
        ? "關於我們 | Meridian CPA & Advisory"
        : "More about Us | Meridian CPA & Advisory";
    return () => {
      document.title =
        "Meridian CPA & Advisory | Audit, Tax & Accounting Firm Hong Kong";
    };
  }, [lang]);

  return (
    <main className="flex min-h-screen w-full flex-col bg-[#F9F9F6]">
      <header className="flex w-full items-center justify-between bg-[#0f2a1d] px-4 sm:px-8 lg:px-[50px] py-3 sm:py-4">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Meridian CPA Home">
          <MeridianLogo variant="light" />
        </Link>
        <div className="flex items-center gap-2 text-[12px] font-medium text-white/60">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`hover:text-white transition-colors ${lang === "en" ? "text-white font-bold" : ""}`}
          >
            EN
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => setLang("zh")}
            className={`hover:text-white transition-colors ${lang === "zh" ? "text-white font-bold" : ""}`}
          >
            繁
          </button>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-6 py-16 sm:px-12 sm:py-24">
        <h1 className="text-[clamp(1.75rem,4vw,2.2rem)] font-bold text-[#0F2A1D] tracking-tight leading-tight">
          {t.title}
        </h1>
        <p className="text-[1.05rem] leading-relaxed text-[#2C3E35]">{t.body}</p>
        <Link
          to="/"
          className="mt-4 inline-flex w-fit rounded-full bg-[#0F2A1D] px-8 py-3 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#C9A84C] hover:text-[#0F2A1D]"
        >
          {t.back}
        </Link>
      </section>
    </main>
  );
};
