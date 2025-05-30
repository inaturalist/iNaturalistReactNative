/* eslint no-console: 0 */

const fsp = require( "fs/promises" );
const path = require( "path" );

const SUPPORTED_APP_STORE_LOCALES = [
  "ar-SA",
  "ca",
  "cs",
  "da",
  "de-DE",
  "el",
  "en-AU",
  "en-CA",
  "en-GB",
  "en-US",
  "es-ES",
  "es-MX",
  "fi",
  "fr-CA",
  "fr-FR",
  "he",
  "hi",
  "hr",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "ms",
  "nl-NL",
  "no",
  "pl",
  "pt-BR",
  "pt-PT",
  "ro",
  "ru",
  "sk",
  "sv",
  "th",
  "tr",
  "uk",
  "vi",
  "zh-Hans",
  "zh-Hant",
  "default"
];

const CROWDIN_TO_APP_STORE_MAPPINGS = {
  ar: "ar-SA",
  de: "de-DE",
  fr: "fr-FR",
  en_AU: "en-AU",
  en_CA: "en-CA",
  en_GB: "en-GB",
  en: "en-US",
  es: "es-ES",
  es_MX: "es-MX",
  fr_CA: "fr-CA",
  nl: "nl-NL",
  pt: "pt-PT",
  pt_BR: "pt-BR"
};

const SUPPORTED_GOOGLE_PLAY_LOCALES = [
  "af",
  "sq",
  "am",
  "ar",
  "hy-AM",
  "az-AZ",
  "bn-BD",
  "eu-ES",
  "be",
  "bg",
  "my-MM",
  "ca",
  "zh-HK",
  "zh-CN",
  "zh-TW",
  "hr",
  "cs-CZ",
  "da-DK",
  "nl-NL",
  "en-AU",
  "en-CA",
  "en-GB",
  "en-IN",
  "en-SG",
  "en-US",
  "en-ZA",
  "et",
  "fil",
  "fi-FI",
  "fr-CA",
  "fr-FR",
  "gl-ES",
  "ka-GE",
  "de-DE",
  "el-GR",
  "gu",
  "iw-IL",
  "hi-IN",
  "hu-HU",
  "is-IS",
  "id",
  "it-IT",
  "ja-JP",
  "kn-IN",
  "kk",
  "km-KH",
  "ko-KR",
  "ky-KG",
  "lo-LA",
  "lv",
  "lt",
  "mk-MK",
  "ms-MY",
  "ms",
  "ml-IN",
  "mr-IN",
  "mn-MN",
  "ne-NP",
  "no-NO",
  "fa",
  "fa-AE",
  "fa-AF",
  "fa-IR",
  "pl-PL",
  "pt-BR",
  "pt-PT",
  "pa",
  "ro",
  "rm",
  "ru-RU",
  "sr",
  "si-LK",
  "sk",
  "sl",
  "es-419",
  "es-ES",
  "es-US",
  "sw",
  "sv-SE",
  "ta-IN",
  "te-IN",
  "th",
  "tr-TR",
  "uk",
  "ur",
  "vi",
  "zu"
];

const CROWDIN_TO_GOOGLE_PLAY_MAPPINGS = {
  "af-ZA": "af",
  "sq-AL": "sq",
  "ar-SA": "ar",
  "be-BY": "be",
  "bg-BG": "bg",
  "ca-ES": "ca",
  "he-IL": "iw-IL",
  "hr-HR": "hr",
  "et-EE": "et",
  "fil-PH": "fil",
  "gu-IN": "gu",
  "id-ID": "id",
  "kk-KZ": "kk",
  "lv-LV": "lv",
  "lt-LT": "lt",
  // TODO: change in crowdin?
  "nb-NO": "no-NO",
  "pa-IN": "pa",
  "ro-RO": "ro",
  "rm-CH": "rm",
  "sr-CS": "sr",
  "sk-SK": "sk",
  "sl-SI": "sl",
  "sw-KE": "sw",
  "th-TH": "th",
  "uk-UA": "uk",
  "ur-PK": "ur",
  "vi-VN": "vi",
  "zu-ZA": "zu"
};

const FASTLANE_METADATA_PATH = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "fastlane/metadata"
);

async function renameDirectories( options = {} ) {
  // Get all directories in fastlane/metadata/ios
  const iosDirectories = await fsp
    .readdir( path.join( FASTLANE_METADATA_PATH, "ios" ), {
      withFileTypes: true
    } )
    .then( files => files.filter( file => file.isDirectory() ).map( file => file.name ) );
  await Promise.all(
    iosDirectories.map( async directory => {
      const locale = CROWDIN_TO_APP_STORE_MAPPINGS[directory];
      if ( !locale ) return;
      const directoryPath = path.join( FASTLANE_METADATA_PATH, "ios", directory );
      const newDirectoryPath = path.join( FASTLANE_METADATA_PATH, "ios", locale );
      // Remove a potentially existing directory with the same name
      try {
        await fsp.rmdir( newDirectoryPath, { recursive: true } );
        if ( options.verbose ) {
          console.log( "Removed existing directory", newDirectoryPath );
        }
      } catch ( _e ) {
        // Directory did not exist
      }
      if ( options.verbose ) {
        console.log(
          "Renaming directory",
          directoryPath,
          "to",
          newDirectoryPath
        );
      }
      await fsp.rename( directoryPath, newDirectoryPath );
    } )
  );
  const androidDirectories = await fsp
    .readdir( path.join( FASTLANE_METADATA_PATH, "android" ), {
      withFileTypes: true
    } )
    .then( files => files.filter( file => file.isDirectory() ).map( file => file.name ) );
  return Promise.all(
    androidDirectories.map( async directory => {
      const locale = CROWDIN_TO_GOOGLE_PLAY_MAPPINGS[directory];
      if ( !locale ) return;
      const directoryPath = path.join( FASTLANE_METADATA_PATH, "android", directory );
      const newDirectoryPath = path.join( FASTLANE_METADATA_PATH, "android", locale );
      // Remove a potentially existing directory with the same name
      try {
        await fsp.rmdir( newDirectoryPath, { recursive: true } );
        if ( options.verbose ) {
          console.log( "Removed existing directory", newDirectoryPath );
        }
      } catch ( _e ) {
        // Directory did not exist
      }
      if ( options.verbose ) {
        console.log(
          "Renaming directory",
          directoryPath,
          "to",
          newDirectoryPath
        );
      }
      await fsp.rename( directoryPath, newDirectoryPath );
    } )
  );
}

async function removeUnsupportedDirectories( options = {} ) {
  // Get all directories in fastlane/metadata/ios
  const iosDirectories = await fsp
    .readdir( path.join( FASTLANE_METADATA_PATH, "ios" ), {
      withFileTypes: true
    } )
    .then( files => files.filter( file => file.isDirectory() ).map( file => file.name ) );
  await Promise.all(
    iosDirectories.map( async directory => {
      if ( SUPPORTED_APP_STORE_LOCALES.indexOf( directory ) >= 0 ) return;
      const directoryPath = path.join( FASTLANE_METADATA_PATH, "ios", directory );
      if ( options.verbose ) {
        console.log( "Removing unsupported directory", directoryPath );
      }
      await fsp.rmdir( directoryPath, { recursive: true } );
    } )
  );
  const androidDirectories = await fsp
    .readdir( path.join( FASTLANE_METADATA_PATH, "android" ), {
      withFileTypes: true
    } )
    .then( files => files.filter( file => file.isDirectory() ).map( file => file.name ) );
  return Promise.all(
    androidDirectories.map( async directory => {
      if ( SUPPORTED_GOOGLE_PLAY_LOCALES.indexOf( directory ) >= 0 ) {
        if ( options.verbose ) {
          console.log( "Supported directory", directory );
        }
        return;
      }
      const directoryPath = path.join( FASTLANE_METADATA_PATH, "android", directory );
      if ( options.verbose ) {
        console.log( "Removing unsupported directory", directoryPath );
      }
      await fsp.rmdir( directoryPath, { recursive: true } );
    } )
  );
}

// Copy title.txt from en-US directory into all the other directories.
// This is necessary because Google Play requires a title.txt file in every locale directory
// and we have not added title file to crowdin for translations.
async function copyAndroidTitle( options = {} ) {
  // Get all directories in fastlane/metadata/android
  const androidDirectories = await fsp
    .readdir( path.join( FASTLANE_METADATA_PATH, "android" ), {
      withFileTypes: true
    } )
    .then( files => files.filter( file => file.isDirectory() ).map( file => file.name ) );
  // Copy title.txt from en-US directory into all the other directories
  const titlePath = path.join( FASTLANE_METADATA_PATH, "android", "en-US", "title.txt" );
  await Promise.all(
    androidDirectories.map( async directory => {
      const directoryPath = path.join( FASTLANE_METADATA_PATH, "android", directory );
      if ( options.verbose ) {
        console.log( "Copying title.tx into: ", directoryPath );
      }
      await fsp.copyFile( titlePath, path.join( directoryPath, "title.txt" ) );
    } )
  );
}

module.exports = {
  copyAndroidTitle,
  removeUnsupportedDirectories,
  renameDirectories
};
