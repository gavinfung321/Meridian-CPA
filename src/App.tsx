import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Language } from "./lib/translations";
import { AboutUs } from "./screens/AboutUs/AboutUs";
import { Desktop } from "./screens/Desktop/Desktop";

export const App = (): JSX.Element => {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  }, [lang]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Desktop lang={lang} setLang={setLang} />} />
        <Route path="/about" element={<AboutUs lang={lang} setLang={setLang} />} />
      </Routes>
    </BrowserRouter>
  );
};
