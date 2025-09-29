import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// FIX: The CDN build for this library does not expose a standard ES module default export.
// A namespace import (`* as ...`) is required to load the module correctly, similar
// to how the Supabase client is imported.
import * as Backend from 'i18next-http-backend';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  // FIX: Pass the .default property of the imported module namespace to .use().
  // The namespace object itself is not a valid plugin.
  .use(Backend.default)
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files)
    supportedLngs: ['en', 'hi'],
    fallbackLng: 'en',
    debug: true,
    
    // backend options
    backend: {
        loadPath: '/locales/{{lng}}.json',
    },

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;