/* eslint no-console: 0 */

const fluent = require( "fluent_conv" );
const yargs = require( "yargs" );
const fs = require( "fs" );
const {
  parse: parseFtl,
  serialize: serializeFtl,
  Resource
} = require( "@fluent/syntax" );

const { readFile, writeFile } = fs.promises;
const path = require( "path" );
const util = require( "util" );
const glob = util.promisify( require( "glob" ) );
const {
  difference,
  flatten,
  sortBy,
  uniq
} = require( "lodash" );

// Convert a single FTL file to JSON
const jsonifyPath = async ( inPath, outPath, options = { } ) => {
  let ftlTxt;
  try {
    ftlTxt = await readFile( inPath );
  } catch ( readFileErr ) {
    console.error( `Could not read ${inPath}, skipping...` );
    if ( options.debug ) {
      console.error( "Failed to read input file with error:" );
      console.error( readFileErr );
      console.error( readFileErr.stack );
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
    await writeFile( outPath, `${JSON.stringify( localizations, null, 2 )}\n` );
  } catch ( writeFileErr ) {
    console.error( `Failed to write ${outPath} with error:` );
    console.error( writeFileErr );
    console.error( writeFileErr.stack );
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
  // For each locale, convert the .ftl files to .ftl.json files
  await Promise.all( locales.map( async locale => {
    const inPath = path.join( __dirname, "l10n", `${locale}.ftl` );
    const outPath = path.join( __dirname, "l10n", `${locale}.ftl.json` );
    if ( await jsonifyPath( inPath, outPath, options ) ) {
      converted.push( locale );
    } else {
      failed.push( locale );
    }
  } ) );
  console.log( `✅ Converted: ${converted.sort( ).join( ", " )}` );
  if ( failed.length > 0 ) {
    console.error( `❌ Failed:    ${failed.sort( ).join( ", " )}` );
  }
};

// Write loadTranslations.js, a file with a function that statically loads
// translation files given a locale
const writeLoadTranslations = async ( ) => {
  const locales = await supportedLocales( );
  const outPath = path.join( __dirname, "loadTranslations.js" );
  const out = fs.createWriteStream( outPath );
  out.write( "// AUTO-GENERATED. See i18ncli.js\n" );
  out.write( "export default locale => {\n" );
  locales.forEach(
    locale => out.write(
      `  if ( locale === "${locale}" ) { return require( "./l10n/${locale}.ftl.json" ); }\n`
    )
  );
  out.write( "  return require( \"./l10n/en.ftl.json\" );\n" );
  out.write( "};\n" );
};

async function validate( ) {
  const stringsPath = path.join( __dirname, "strings.ftl" );
  const ftlTxt = await readFile( stringsPath );
  const ftl = parseFtl( ftlTxt.toString( ) );
  const errors = [];
  // Chalk does not expose a CommonJS module, so we have to do this
  const { default: chalk } = await import( "chalk" );
  const keys = {};
  ftl.body.forEach( item => {
    if ( item.type === "GroupComment" ) {
      errors.push(
        `Group comments are not allowed: ${chalk.gray( `## ${item.content.slice( 0, 100 )}` )}`
      );
    }
    if ( item.type === "Junk" ) {
      let error = `Invalid Fluent syntax: ${chalk.gray( item.content.slice( 0, 100 ).trim( ) )}`;
      if ( item.annotations ) {
        error += item.annotations.map( anno => `\n\t${anno.message}` );
      }
      errors.push( error );
    }
    if ( item.type === "Message" ) {
      if ( keys[item.id.name] ) {
        errors.push( `Duplicate key: ${item.id.name}` );
      } else {
        keys[item.id.name] = true;
      }
    }
  } );
  if ( errors.length > 0 ) {
    console.error( `❌ ${errors.length} errors found in ${stringsPath}:` );
    errors.forEach( error => {
      console.error( chalk.red( "[Error]" ), error );
    } );
    process.exit( 1 );
  }
  console.log( `✅ ${stringsPath} validated` );
}

async function normalize( ) {
  const stringsPath = path.join( __dirname, "strings.ftl" );
  const ftlTxt = await readFile( stringsPath );
  const ftl = parseFtl( ftlTxt.toString( ) );
  const resourceComments = [];
  const messages = [];
  // Extract the elements that matter
  ftl.body.forEach( item => {
    if ( item.type === "ResourceComment" ) resourceComments.push( item );
    if ( item.type === "Message" ) messages.push( item );
  } );
  // Alphabetize the messages
  const sortedMessages = messages.sort( ( msg1, msg2 ) => {
    if ( msg1.id.name.toLowerCase( ) < msg2.id.name.toLowerCase( ) ) return -1;
    if ( msg1.id.name.toLowerCase( ) > msg2.id.name.toLowerCase( ) ) return 1;
    return 0;
  } );
  // Make a new Resource to serialize, ensuring all ResourceComments are at
  // the top
  const newResource = new Resource( [
    ...resourceComments,
    ...sortedMessages
  ] );
  const newFtlTxt = serializeFtl( newResource );
  await writeFile( stringsPath, newFtlTxt );
  console.log( `✅ ${stringsPath} normalized` );
}

async function getKeys( ) {
  const stringsPath = path.join( __dirname, "strings.ftl" );
  const ftlTxt = await readFile( stringsPath );
  const ftl = parseFtl( ftlTxt.toString( ) );
  return ftl.body.filter( item => item.type === "Message" ).map( msg => msg.id.name );
}

async function getKeysInUse( ) {
  const paths = await glob( path.join( __dirname, "..", "**", "*.{js,ts,jsx,tsx}" ) );
  const allKeys = await Promise.all( paths.map( async srcPath => {
    const src = await readFile( srcPath );
    const tMatches = [...src.toString( ).matchAll( /[^A-z]t\(\s*["']([\w-_\s]+?)["']/g )];
    const i18nkeyMatches = [...src.toString( ).matchAll( /i18nKey=["']([\w-_\s]+?)["']/g )];
    return [...tMatches, ...i18nkeyMatches].map( match => match[1] );
  } ) );
  return sortBy( uniq( flatten( allKeys ) ) );
}

async function unused( ) {
  const keys = await getKeys( );
  const keysInUse = await getKeysInUse( );
  const unusedKeys = difference( keys, keysInUse );
  if ( unusedKeys.length === 0 ) {
    console.log( "✅ No unused keys" );
  } else {
    console.error( `❌ ${unusedKeys.length} unused keys found: ${unusedKeys}` );
    process.exit( 1 );
  }
}

async function untranslatable( ) {
  const keys = await getKeys( );
  const keysInUse = await getKeysInUse( );
  const untranslatableKeys = difference( keysInUse, keys );
  if ( untranslatableKeys.length === 0 ) {
    console.log( "✅ No keys missing in strings.ftl" );
  } else {
    console.error(
      `❌ ${untranslatableKeys.length} keys in use missing from strings.ftl: ${untranslatableKeys}`
    );
    process.exit( 1 );
  }
}

// eslint-disable-next-line no-unused-expressions
yargs
  .usage( "Usage: $0 <cmd> [args]" )
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
    async argv => {
      await validate( );
      await normalize( );
      await untranslatable( );
      await unused( );
      jsonifyLocalizations( argv );
      writeLoadTranslations( );
    }
  )
  .command(
    "validate",
    "Validate source strings",
    ( ) => { },
    _argv => {
      validate( );
    }
  )
  .command(
    "normalize",
    "Normalize source strings",
    ( ) => { },
    _argv => {
      normalize( );
    }
  )
  .command(
    "unused",
    "List unused translation keys",
    ( ) => { },
    _argv => {
      unused( );
    }
  )
  .command(
    "untranslatable",
    "List translation keys in source code but not in strings.ftl",
    ( ) => { },
    _argv => {
      untranslatable( );
    }
  )
  // TODO make commands that look for untranslated strings and translated
  // strings that are no longer in use
  .help( )
  .argv;
