/* eslint no-console: 0 */

const yargs = require( "yargs" );
const fsp = require( "fs/promises" );
const path = require( "path" );

const SUPPORTED_IOS_METADATA_LOCALES = [
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
  "appleTV",
  "iMessage",
  "default"
];

const MAPPINGS = {
  ar: "ar-SA",
  de: "de-DE",
  fr: "fr-FR",
  en_AU: "en-AU",
  en_CA: "en-CA",
  en_GB: "en-GB",
  en_US: "en-US",
  es: "es-ES",
  es_MX: "es-MX",
  fr_CA: "fr-CA",
  nl: "nl-NL",
  pt: "pt-PT",
  pt_BR: "pt-BR"
};

function mapLanguageCodeToSupportedDirectoryName( languageCode ) {
  return MAPPINGS[languageCode];
}

async function renameDirectories( ) {
  // Get all directories in fastlane/metadata/ios
  const directories = await fsp.readdir( path.join( __dirname, "ios" ), {
    withFileTypes: true
  } ).then( files => files.filter( file => file.isDirectory( ) ).map( file => file.name ) );
  console.log( "Current list of the directories in fastlane/metadata/ios", directories );
  await Promise.all( directories.map( async directory => {
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
}

async function removeUnsupportedDirectories( ) {
  // Get all directories in fastlane/metadata/ios
  const directories = await fsp.readdir( path.join( __dirname, "ios" ), {
    withFileTypes: true
  } ).then( files => files.filter( file => file.isDirectory( ) ).map( file => file.name ) );
  console.log( "Current list of the directories in fastlane/metadata/ios", directories );
  return Promise.all( directories.map( async directory => {
    if ( SUPPORTED_IOS_METADATA_LOCALES.indexOf( directory ) >= 0 ) return;
    const directoryPath = path.join( __dirname, "ios", directory );
    console.log( "Removing unsupported directory", directoryPath );
    await fsp.rmdir( directoryPath, { recursive: true } );
  } ) );
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
  .help( )
  .argv;
