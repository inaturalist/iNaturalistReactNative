/**
 * @generated SignedSource<<7d0f7ede07f1a121c1b64e8ac61e16c5>>
 * @codegen-command : phps FBSyncAll
 *
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * !! This file is synchronized from fbsource. You should not     !!
 * !! modify it directly. Instead:                                !!
 * !!                                                             !!
 * !! 1) Update this file on fbsource and land your change there. !!
 * !! 2) A sync diff should be created and accepted automatically !!
 * !!    within 30 minutes that copies the changes you made on    !!
 * !!    fbsource to www. All that's left is to verify the        !!
 * !!    revision is good land it on www.                         !!
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

 import type {TranslationScriptOutput} from "./translate-fbts";

 const invariant = require( "invariant" );
 const fs = require( "fs" );
 const path = require( "path" );


// here is the list of ISO-639 language codes currently supported in iOS (Nov 10, 2021)
// https://www.ibabbleon.com/iOS-Language-Codes-ISO-639.html
const supportedLocaleCodes = {
  ar: "ar",
  ca: "ca",
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
  "zh-HK": "zh-HK",
  hr: "hr",
  cs: "cs",
  da: "da",
  "en-GB": "en-GB",
  "en-AU": "en-AU",
  "en-CA": "en-CA",
  "en-IN": "en-IN",
  "en-IE": "en-IE",
  "en-NZ": "en-NZ",
  "en-SG": "en-SG",
  "en-ZA": "en-ZA",
  fi: "fi",
  fr: "fr",
  "fr-CA": "fr-CA",
  de: "de",
  el: "el",
  he: "he",
  hi: "hi",
  hu: "hu",
  id: "id",
  it: "it",
  ja: "ja",
  ko: "ko",
  ms: "ms",
  nb: "nb",
  pl: "pl",
  "pt-PT": "pt",
  "pt-BR": "pt-BR",
  ro: "ro",
  sk: "sk",
  "es-ES": "es",
  "es-AR": "es-419",
  "es-MX": "es-MX",
  sv: "sv",
  th: "th",
  tr: "tr",
  uk: "uk",
  vi: "vi"
};

 /**
  * Generates locales that comply with iOS resources format
  * https://lokalise.com/blog/getting-started-with-ios-localization/
  *
  * @param locale Locale in the form langCode_regionCode.
  * @return Locale in the form langCode-rRegionCode.
  */
function generateiOSLocale( locale: string ): ?string {
  const langRegionCode = locale.split( "_" );
  invariant(
    langRegionCode.length === 2,
    "Lang-region array must have two items",
  );

  const localeCode = `${langRegionCode[0]}-${langRegionCode[1]}`;

  const twoItemCode = supportedLocaleCodes[localeCode];
  const oneItemCode  = supportedLocaleCodes[langRegionCode[0]];

  if ( twoItemCode ) {
    return twoItemCode;
  } else if ( oneItemCode ) {
    return oneItemCode;
  }
  return null;
}

 function jsonEncodeValues( localeValues ) {
   const encodedValues = {};
   for ( const hash in localeValues ) {
     if ( typeof localeValues[hash] === "string" ) {
      encodedValues[hash] = localeValues[hash];
     } else {
      encodedValues[hash] = "testing";
      // encodedValues[hash] = JSON.stringify( localeValues[hash] );
     }
   }
   return encodedValues;
 }

 /**
  * Take translations output, and write individual JSON files for each locale
  * raw-es_rES/localizable.json => {<hash> = '\'translatedString'\'}
  * raw-ru_rRU/localizable.json
  */
 function generateiOSLocalizableFiles(
   translationOutput: TranslationScriptOutput,
   iOSResDir: string,
   translationsFileName: string,
 ) {
   try {
      for ( const locale in translationOutput ) {
        // console.log( locale, "locale" );
        const iOSLocale = generateiOSLocale( locale );
        if ( iOSLocale === null || iOSLocale === undefined ) {
          continue;
        }
        const lprojDir = path.join( iOSResDir, `${iOSLocale}.lproj` );
        // console.log( lprojDir, "lproj directory" );

       if ( !fs.existsSync( lprojDir ) ) {
         fs.mkdirSync( lprojDir );
       }

       const createFiles = fs.createWriteStream( path.join( lprojDir, translationsFileName ) );

       const values = jsonEncodeValues( translationOutput[locale] );
       const hashes = Object.keys( values );
       hashes.forEach( ( hash ) => {
         const newLine = `"${hash}" = "\\"${values[hash]}\\""`;
         console.log( newLine, "new line" );
        // console.log( newLine, "hash" );
        createFiles.write( newLine + ";\r\n", {encoding: "utf16"} );
       } );
      //  fs.writeFileSync(
      //    path.join( lprojDir, translationsFileName ),
      //    JSON.stringify( jsonEncodeValues( translationOutput[locale] ) ),
      //    {encoding: "utf8"},
      //  );
      }
   } catch ( error ) {
     console.error( "An error ocurred while generating the ios localizables" );
     console.error( error );
     process.exit( 1 );
     throw error;
   }
 }

 module.exports = {
   generateiOSLocalizableFiles
 };
