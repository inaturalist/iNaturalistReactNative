/* eslint no-console: 0 */

const yargs = require( "yargs" );
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

const IOS_MAPPINGS = {
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

const SUPPORTED_ANDROID_METADATA_LOCALES = [
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

const ANDROID_MAPPINGS = {
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

function mapLanguageCodeToSupportedDirectoryName( languageCode ) {
  return IOS_MAPPINGS[languageCode];
}

async function renameDirectories( ) {
  // Get all directories in fastlane/metadata/ios
  const iosDirectories = await fsp.readdir( path.join( __dirname, "ios" ), {
    withFileTypes: true
  } ).then( files => files.filter( file => file.isDirectory( ) ).map( file => file.name ) );
  console.log( "Current list of the directories in fastlane/metadata/ios", iosDirectories );
  await Promise.all( iosDirectories.map( async directory => {
    const locale = mapLanguageCodeToSupportedDirectoryName( directory );
    if ( !locale ) return;
    const directoryPath = path.join( __dirname, "ios", directory );
    const newDirectoryPath = path.join( __dirname, "ios", locale );
    // Remove a potentially existing directory with the same name
    try {
      await fsp.rmdir( newDirectoryPath, { recursive: true } );
      console.log( "Removed existing directory", newDirectoryPath );
    } catch ( e ) {
      // Directory did not exist
    }
    console.log( "Renaming directory", directoryPath, "to", newDirectoryPath );
    await fsp.rename( directoryPath, newDirectoryPath );
  } ) );
  const androidDirectories = await fsp.readdir( path.join( __dirname, "android" ), {
    withFileTypes: true
  } ).then( files => files.filter( file => file.isDirectory( ) ).map( file => file.name ) );
  console.log( "Current list of the directories in fastlane/metadata/android", androidDirectories );
  return Promise.all( androidDirectories.map( async directory => {
    const locale = ANDROID_MAPPINGS[directory];
    if ( !locale ) return;
    const directoryPath = path.join( __dirname, "android", directory );
    const newDirectoryPath = path.join( __dirname, "android", locale );
    // Remove a potentially existing directory with the same name
    try {
      await fsp.rmdir( newDirectoryPath, { recursive: true } );
      console.log( "Removed existing directory", newDirectoryPath );
    } catch ( e ) {
      // Directory did not exist
    }
    console.log( "Renaming directory", directoryPath, "to", newDirectoryPath );
    await fsp.rename( directoryPath, newDirectoryPath );
  } ) );
}

async function removeUnsupportedDirectories( ) {
  // Get all directories in fastlane/metadata/ios
  const iosDirectories = await fsp.readdir( path.join( __dirname, "ios" ), {
    withFileTypes: true
  } ).then( files => files.filter( file => file.isDirectory( ) ).map( file => file.name ) );
  console.log( "Current list of the directories in fastlane/metadata/ios", iosDirectories );
  await Promise.all( iosDirectories.map( async directory => {
    if ( SUPPORTED_APP_STORE_LOCALES.indexOf( directory ) >= 0 ) return;
    const directoryPath = path.join( __dirname, "ios", directory );
    console.log( "Removing unsupported directory", directoryPath );
    await fsp.rmdir( directoryPath, { recursive: true } );
  } ) );
  const androidDirectories = await fsp.readdir( path.join( __dirname, "android" ), {
    withFileTypes: true
  } ).then( files => files.filter( file => file.isDirectory( ) ).map( file => file.name ) );
  console.log( "Current list of the directories in fastlane/metadata/android", androidDirectories );
  return Promise.all( androidDirectories.map( async directory => {
    if ( SUPPORTED_ANDROID_METADATA_LOCALES.indexOf( directory ) >= 0 ) {
      console.log( "Supported directory", directory );
      return;
    }
    const directoryPath = path.join( __dirname, "android", directory );
    console.log( "Removing unsupported directory", directoryPath );
    await fsp.rmdir( directoryPath, { recursive: true } );
  } ) );
}

async function copyAndroidTitle() {
  // Get all directories in fastlane/metadata/android
  const androidDirectories = await fsp
    .readdir( path.join( __dirname, "android" ), {
      withFileTypes: true
    } )
    .then( files => files.filter( file => file.isDirectory() ).map( file => file.name ) );
  // Copy title.txt from en-US directory into all the other directories
  const titlePath = path.join( __dirname, "android", "en-US", "title.txt" );
  await Promise.all(
    androidDirectories.map( async directory => {
      const directoryPath = path.join( __dirname, "android", directory );
      console.log( "Copying title.tx into: ", directoryPath );
      await fsp.copyFile( titlePath, path.join( directoryPath, "title.txt" ) );
    } )
  );
}

// eslint-disable-next-line no-unused-expressions
yargs
  .usage( "Usage: $0 <cmd> [args]" )
  .command(
    "build",
    "Prepare existing localizations for uploading metadata",
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ( ) => {},
    async ( ) => {
      await renameDirectories();
      await removeUnsupportedDirectories();
      await copyAndroidTitle();
    }
  )
  .command(
    "removeUnsupportedDirectories",
    "Remove directories that are not supported by the App Store.",
    ( ) => undefined,
    _argv => {
      removeUnsupportedDirectories( );
    }
  )
  .command(
    "renameDirectories",
    "Rename current list of directories to names supported by the App Store.",
    ( ) => undefined,
    _argv => {
      renameDirectories( );
    }
  )
  .command(
    "copyAndroidTitle",
    "copyAndroidTitle",
    ( ) => undefined,
    _argv => {
      copyAndroidTitle( );
    }
  )
  .help( )
  .argv;
