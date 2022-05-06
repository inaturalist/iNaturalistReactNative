// i18next is the basic i18n library we're using
import i18next from "i18next";
// React tooling for i18next
import { initReactI18next } from "react-i18next";
// Polyfill to support i18next reliance on Intl.PluralRules. See
// https://www.i18next.com/misc/migration-guide#v20.x.x-to-v21.0.0
import "intl-pluralrules";
// i18next plugin that lazy-loads local translations as if they were an
// i18next backend. We're using it to exert some control over how we load
// translations, e.g. to only load translations for one locale at a time.
// Lots of other ways we could do this, and this will probably change
import resourcesToBackend from "i18next-resources-to-backend";
// i18next plugin to use Fluent (https://projectfluent.org) format for
// translated text... though not the actual .ftl file format. Instead it
// accepts FTL key/value pairs as a JS object literal
import Fluent from "i18next-fluent";
// Function to load translations given a locale code. Given that we cannot
// dynamically import/require files in a React Native JS environment
// (https://stackoverflow.com/questions/58858782/using-the-dynamic-import-function-on-node-js),
// we need to do this statically, which means a big control structure that we
// generate before building the app
import loadTranslations from "./loadTranslations";

// Initialize and configure i18next
i18next
  .use( initReactI18next )
  .use( Fluent )
  .use( resourcesToBackend( ( locale, namespace, callback ) => {
    // Note that we're not using i18next namespaces at present
    callback( null, loadTranslations( locale ) );
  } ) )
  .init( {
    // Added since otherwise Android would crash - see here: https://stackoverflow.com/a/70521614 and https://www.i18next.com/misc/migration-guide
    compatibilityJSON: "v3",
    lng: "en",
    // debug: true,
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    react: {
      // Added since otherwise Android would crash - see here: https://stackoverflow.com/a/70521614 and https://www.i18next.com/misc/migration-guide
      useSuspense: false
    }
  } );

  export default i18next;
