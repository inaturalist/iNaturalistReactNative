const fluent = require( "fluent_conv" );
const yargs = require( "yargs" );
const fs = require( "fs" );
const { readFile, writeFile } = fs.promises;
const path = require( "path" );
const util = require( "util" );
const glob = util.promisify( require( "glob" ) );

// Convert a single FTL file to JSON
const jsonifyPath = async ( inPath, outPath, options = { } ) => {
  let ftlTxt;
  try {
    ftlTxt = await readFile( inPath );
  } catch ( readFileErr ) {
    console.log( `Could not read ${inPath}, skipping...` );
    if ( options.debug ) {
      console.log( "Failed to read input file with error:" );
      console.log( readFileErr );
      console.log( readFileErr.stack );
    }
    return false;
  }

  // Allow us to await a result to this callback-based method so we can return
  // true when we know it succeeded
  // TODO un-promisify this and use { respectComments: false } to exclude
  // comments, which are going to add a lot of bulk to these files
  const ftl2js = util.promisify( fluent.ftl2js );
  const localizations = await ftl2js( ftlTxt.toString( ) );
  try {
    await writeFile( outPath, JSON.stringify( localizations, null, 2 ) + "\n" );
  } catch ( writeFileErr ) {
    console.log( `Failed to write ${outPath} with error:` );
    console.log( writeFileErr );
    console.log( writeFileErr.stack );
    process.exit( );
  }
  return true;
};

// Assume all existing localized locales are supported
const supportedLocales = async ( ) => {
  const paths = await glob( path.join( __dirname, "l10n", "*.ftl" ) );
  return paths.map( f => path.basename( f, ".ftl" ) );
};

// Convert all valid localizations from Fluent to Fluent JSON
const jsonifyLocalizations = async ( options = {} ) => {
  const locales = await supportedLocales( );
  const converted = [];
  const failed = [];
  // Copy the source ftl to en.ftl, because en is the default locale and
  // should not really be translated. This also lets you update strings.ftl
  // and run this script without worrying about having at least one
  // localization
  fs.copyFileSync(
    path.join( __dirname, "strings.ftl" ),
    path.join( __dirname, "l10n", "en.ftl" )
  );
  for ( let locale of locales ) {
    const inPath = path.join( __dirname, "l10n", `${locale}.ftl` );
    const outPath = path.join( __dirname, "l10n", `${locale}.ftl.json` );
    // TODO use a pool and make this asynchronous
    if ( await jsonifyPath( inPath, outPath, options ) ) {
      converted.push( locale );
    } else {
      failed.push( locale );
    }
  }
  console.log( `Converted: ${converted.sort( ).join( ", " )}` );
  if ( failed.length > 0 ) {
    console.log( `Failed:    ${failed.sort( ).join( ", " )}` );
  }
};

// Write loadTranslations.js, a file with a function that statically load
// translation files given a locale
const writeLoadTranslations = async ( ) => {
  const locales = await supportedLocales( );
  const outPath = path.join( __dirname, "loadTranslations.js" );
  const out = fs.createWriteStream( outPath );
  out.write( "// AUTO-GENERATED. See i18ncli.js\n" );
  out.write( "export default locale => {\n" );
  for ( let locale of locales ) {
    out.write( `  if ( locale === "${locale}" ) { return require( "./l10n/${locale}.ftl.json" ); }\n` );
  }
  out.write( "  return require( \"./l10n/en.ftl.json\" );\n" );
  out.write( "};\n" );
};

yargs.usage( "Usage: $0 <cmd> [args]" )
  .command(
    "ftl2json",
    "Convert all existing Fluent localizations to Fluent JSON",
    ftl2jsonCmd => {
      ftl2jsonCmd
        .describe( "debug", "Print debug statements" );
    },
    argv => {
      jsonifyLocalizations( argv );
    }
  )
  .command(
    "write-translation-loader",
    "Write loadTranslations.js",
    ( ) => {},
    ( ) => writeLoadTranslations( )
  )
  .command(
    "build",
    "Prepare existing localizations for use in the app",
    ( ) => {},
    argv => {
      jsonifyLocalizations( argv );
      writeLoadTranslations( );
    }
  )
  // TODO make commands that look for untranslated strings and translated
  // strings that are no longer in use
  .help( )
  .argv;
