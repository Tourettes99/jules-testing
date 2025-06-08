import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend'; // To load translations from public/locales

i18n
  .use(HttpApi) // Use http backend to load translations
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language if current language translation is missing
    supportedLngs: ['en', 'da'], // Supported languages
    debug: process.env.NODE_ENV === 'development', // Enable debug output in development

    // Backend options for i18next-http-backend
    // This tells it where to load translation files from.
    // %PUBLIC_URL% is not directly available in JS, so we use a relative path.
    // Create React App serves the `public` folder at the root.
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    interpolation: {
      escapeValue: false, // React already safes from xss
    },

    // Default namespace (optional if you only have one file per language)
    // ns: ['translation'],
    // defaultNS: 'translation',
  });

export default i18n;
