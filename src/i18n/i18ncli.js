/* eslint no-console: 0 */

import fs from "fs";
import {
  copyAndroidTitle,
  removeUnsupportedDirectories,
  renameDirectories
} from "i18n/i18ncli/fastlane";
import {
  jsonifyLocalizations,
  normalize,
  normalizeFileNames,
  supportedLocales,
  untranslatable,
  unused,
  validate
} from "i18n/i18ncli/ftl";
import path from "path";
import yargs from "yargs";

// Write loadTranslations.js, a file with a function that statically loads
// translation files given a locale
const writeLoadTranslations = async ( ) => {
  const locales = await supportedLocales( );
  const outPath = path.join( __dirname, "loadTranslations.js" );
  const out = fs.createWriteStream( outPath );
  const commentPathPieces = __filename.split( path.sep );
  const commentPath = path.join(
    ...commentPathPieces.slice( commentPathPieces.indexOf( "src" ), commentPathPieces.length )
  );
  out.write( `// AUTO-GENERATED. See ${commentPath}\n` );
  out.write( "export default locale => {\n" );
  locales.forEach(
    locale => out.write(
      `  if ( locale === "${locale}" ) { return require( "./l10n/${locale}.ftl.json" ); }\n`
    )
  );
  out.write( "  return require( \"./l10n/en.ftl.json\" );\n" );
  out.write( "};\n" );
  out.write( "\n" );
  out.write( "export const SUPPORTED_LOCALES = [\n" );
  out.write( locales.sort( ).map( l => `  "${l}"` ).join( ",\n" ) );
  out.write( "\n];\n" );
};

// eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
yargs
  .usage( "Usage: $0 <cmd> [args]" )
  .option( "verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging"
  } )
  .command(
    "build",
    "Prepare existing localizations for use in the app",
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ( ) => {},
    async argv => {
      // Make sure all files are iNat locales before validating and
      // normalizing FT
      await normalizeFileNames( );
      await validate( );
      await normalize( );
      await untranslatable( );
      await unused( );
      jsonifyLocalizations( argv );
      writeLoadTranslations( );
    }
  )
  .command(
    "checkify",
    "Prepend translations w/ ✅ to help see unglobalized text",
    ( ) => undefined,
    async argv => {
      jsonifyLocalizations( { ...argv, checkify: true } );
      writeLoadTranslations( );
    }
  )
  .command(
    "validate",
    "Validate source strings",
    ( ) => undefined,
    _argv => {
      validate( );
    }
  )
  .command(
    "unused",
    "List unused translation keys",
    ( ) => undefined,
    _argv => {
      unused( );
    }
  )
  .command(
    "untranslatable",
    "List translation keys in source code but not in strings.ftl",
    ( ) => undefined,
    _argv => {
      untranslatable( );
    }
  )
  .command(
    "prepare-fastlane-metadata",
    "Prepare existing localizations for uploading metadata via Fastlane",
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ( ) => {},
    async argv => {
      console.log( "Renaming directories..." );
      await renameDirectories( argv );
      console.log( "Removing unsupported directories..." );
      await removeUnsupportedDirectories( argv );
      console.log( "Copying Android title..." );
      await copyAndroidTitle( argv );
    }
  )
  .help( )
  .argv;
