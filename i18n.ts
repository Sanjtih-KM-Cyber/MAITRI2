import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(HttpApi) // new
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