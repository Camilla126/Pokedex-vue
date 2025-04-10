import { createI18n } from "vue-i18n";

import pt from "./locales/pt.json";
import en from "./locales/en.json";
import es from "./locales/es.json";

const getBrowserLocale = () => {
  const navigatorLocale =
    navigator.languages !== undefined
      ? navigator.languages[0]
      : navigator.language;

  if (!navigatorLocale) {
    return "pt";
  }

  const locale = navigatorLocale.trim().split(/[-_]/)[0];
  return ["pt", "en", "es"].includes(locale) ? locale : "pt";
};

const getStoredLocale = () => {
  const storedLocale = localStorage.getItem("pokedex-locale");
  return storedLocale || getBrowserLocale();
};

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getStoredLocale(),
  fallbackLocale: "pt",
  messages: {
    pt,
    en,
    es,
  },
});

export const setLocale = (locale) => {
  i18n.global.locale.value = locale;
  localStorage.setItem("pokedex-locale", locale);
  document.documentElement.setAttribute("lang", locale);
};

export const availableLocales = [
  { value: "pt", label: "Português" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];
