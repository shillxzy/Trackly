/**
 * Frontend/src/context/LanguageContext.js
 *
 * Використання в будь-якому компоненті:
 *   const t = useT();
 *   <h1>{t("home.welcome", { username: "Dmytro" })}</h1>
 *
 * Перемикання мови:
 *   const { setLang } = useLanguage();
 *   setLang("uk");  // або "en"
 */

import { createContext, useContext, useState } from "react";
import en from "../translations/en.json";
import uk from "../translations/uk.json";

const TRANSLATIONS = { en, uk };
const STORAGE_KEY  = "app_language";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "en"
  );

  const setLang = (newLang) => {
    if (!TRANSLATIONS[newLang]) return;
    localStorage.setItem(STORAGE_KEY, newLang);
    setLangState(newLang);
  };

  /**
   * Отримати переклад за ключем типу "home.welcome"
   * Підтримує interpolation: t("home.welcome", { username: "Dmytro" })
   *   → "Welcome back, Dmytro!"
   */
  const t = (key, vars = {}) => {
    const keys   = key.split(".");
    const dict   = TRANSLATIONS[lang] || TRANSLATIONS["en"];
    let   result = dict;

    for (const k of keys) {
      if (result && typeof result === "object") {
        result = result[k];
      } else {
        result = undefined;
        break;
      }
    }

    if (result === undefined) {
      // Fallback до англійської якщо ключ не знайдено в поточній мові
      let fallback = TRANSLATIONS["en"];
      for (const k of keys) {
        if (fallback && typeof fallback === "object") fallback = fallback[k];
        else { fallback = key; break; }
      }
      result = fallback ?? key;
    }

    if (typeof result !== "string") return key;

    // Interpolation: замінюємо {{username}} → значення
    return result.replace(/\{\{(\w+)\}\}/g, (_, k) =>
      vars[k] !== undefined ? String(vars[k]) : `{{${k}}}`
    );
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Хук для отримання поточної мови і функції перемикання */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}

/** Хук-скорочення — повертає лише функцію t() */
export function useT() {
  return useLanguage().t;
}
