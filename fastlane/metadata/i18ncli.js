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

async function removeUnsupportedDirectories( ) {
  // Get all directories in fastlane/metadata/ios
  const directories = await fsp.readdir( path.join( __dirname, "ios" ), {
    withFileTypes: true
  } ).then( files => files.filter( file => file.isDirectory( ) ).map( file => file.name ) );
  console.log( "directories", directories );
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
      await removeUnsupportedDirectories();
    }
  )
  .command(
    "removeUnsupportedDirectories",
    "removeUnsupportedDirectories",
    ( ) => undefined,
    _argv => {
      removeUnsupportedDirectories( );
    }
  )
  .help( )
  .argv;
