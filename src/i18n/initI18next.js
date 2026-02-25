// i18next is the basic i18n library we're using
// Polyfill to support i18next reliance on Intl.PluralRules. See
// https://www.i18next.com/misc/migration-guide#v20.x.x-to-v21.0.0
import "intl-pluralrules";

import i18next from "i18next";
// i18next plugin to use Fluent (https://projectfluent.org) format for
// translated text... though not the actual .ftl file format. Instead it
// accepts FTL key/value pairs as a JS object literal
import Fluent from "i18next-fluent";
// i18next plugin that lazy-loads local translations as if they were an
// i18next backend. We're using it to exert some control over how we load
// translations, e.g. to only load translations for one locale at a time.
// Lots of other ways we could do this, and this will probably change
import resourcesToBackend from "i18next-resources-to-backend";
// React tooling for i18next
import { initReactI18next } from "react-i18next";
import { Text } from "react-native";
import * as RNLocalize from "react-native-localize";
import { zustandStorage } from "stores/useStore";

// Function to load translations given a locale code. Given that we cannot
// dynamically import/require files in a React Native JS environment
// (https://stackoverflow.com/questions/58858782/using-the-dynamic-import-function-on-node-js),
// we need to do this statically, which means a big control structure that we
// generate before building the app
import loadTranslations, { SUPPORTED_LOCALES } from "./loadTranslations";

function cleanLocaleName( locale ) {
  return locale.replace( "_", "-" ).replace( /@.*/, "" );
}

export function getInatLocaleFromSystemLocale() {
  const systemLocale = RNLocalize.getLocales( )?.[0]?.languageTag || "en";
  const candidateLocale = cleanLocaleName( systemLocale );
  let inatLocale = candidateLocale;
  if ( !SUPPORTED_LOCALES.includes( candidateLocale ) ) {
    const lang = candidateLocale.split( "-" )[0];
    inatLocale = SUPPORTED_LOCALES.includes( lang )
      ? lang
      : "en";
  }
  return inatLocale;
}

function getInatNextLocale() {
  const currentLocale = zustandStorage.getItem( "currentLocale" );
  return currentLocale || getInatLocaleFromSystemLocale( );
}

const LOCALE = cleanLocaleName( getInatNextLocale( ) );

export const I18NEXT_CONFIG = {
  // Added since otherwise Android would crash - see here: https://stackoverflow.com/a/70521614 and https://www.i18next.com/misc/migration-guide
  lng: LOCALE,
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
  react: {
    // Added since otherwise Android would crash - see here: https://stackoverflow.com/a/70521614 and https://www.i18next.com/misc/migration-guide
    useSuspense: false,
    defaultTransParent: Text,
  },
  // For some reason this is how you pass options to i18next-fluent, per
  // https://github.com/i18next/i18next-fluent?tab=readme-ov-file#options
  i18nFormat: {
    fluentBundleOptions: {
      useIsolating: false,
      functions: {
        VOWORCON: ( [txt] ) => (
          "aeiou".indexOf( txt[0].toLowerCase( ) ) >= 0
            ? "vow"
            : "con"
        ),
        JOIN: ( args, opts = {} ) => args
          .filter( Boolean )
          .filter( s => typeof ( s ) === "string" )
          .join( opts.separator ),
      },
    },
  },
  // All languages should fallback to English, some regional variants should
  // fall back to another region
  fallbackLng: code => {
    if ( !code ) {
      return ["en"];
    }
    const fallbacks = [];
    if ( code.match( /^es-/ ) ) {
      fallbacks.push( "es" );
    } else if ( code.match( /^fr-/ ) ) {
      fallbacks.push( "fr" );
    } else if ( code.match( /^pt-/ ) ) {
      fallbacks.push( "pt" );
    }
    return [...fallbacks, "en"];
  },
};

export default async function initI18next( config = {} ) {
  // Initialize and configure i18next
  return i18next
    .use( initReactI18next )
    .use( Fluent )
    .use( resourcesToBackend( ( locale, namespace, callback ) => {
      // Note that we're not using i18next namespaces at present
      callback( null, loadTranslations( locale ) );
    } ) )
    .init( { ...I18NEXT_CONFIG, ...config } );
}
