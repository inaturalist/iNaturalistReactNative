import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";

const userLocale = RNLocalize.getLocales( )[0].languageTag;

// I don't really get why all this is needed, but this is the format i18next expects
// according to this package https://github.com/DylanVann/i18next-react-native-language-detector
const languageDetector = {
  init: Function.prototype,
  type: "languageDetector",
  detect: () => userLocale,
  cacheUserLanguage: Function.prototype
};

// following setup from https://locize.com/blog/how-to-internationalize-react-i18next/#why-i18next
i18n
  // detect user language
  .use( languageDetector )
  // pass the i18n instance to react-i18next.
  .use( initReactI18next )
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init( {
    debug: true,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          description: {
            part1: "Edit src/App.js and save to reload.",
            part2: "Learn React"
          },
          counter_one: "Changed language just once",
          counter_other: "Changed language already {{count}} times"
        }
      },
      de: {
        translation: {
          description: {
            part1: "Ändere src/App.js und speichere um neu zu laden.",
            part2: "Lerne React"
          },
          counter_one: "Die Sprache wurde erst ein mal gewechselt",
          counter_other: "Die Sprache wurde {{count}} mal gewechselt"
        }
      }
    }
  } );

export default i18n;
