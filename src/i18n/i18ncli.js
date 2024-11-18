/* eslint no-console: 0 */

const fluent = require( "fluent_conv" );
const yargs = require( "yargs" );
const fs = require( "fs" );
const {
  parse: parseFtl,
  serialize: serializeFtl,
  Resource
} = require( "@fluent/syntax" );
const fsp = require( "fs/promises" );
const path = require( "path" );
const util = require( "util" );
const { glob } = require( "glob" );
const {
  difference,
  flatten,
  sortBy,
  uniq
} = require( "lodash" );
const { format, parseISO } = require( "date-fns" );
const { enUS } = require( "date-fns/locale" );

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

// Exceptions to the rule that all locales should be specified as two-letter
// language code only
const SUPPORTED_REGIONAL_LOCALES = [
  "en-GB",
  "en-NZ",
  "es-AR",
  "es-CO",
  "es-CR",
  "es-MX",
  "fr-CA",
  "pt-BR",
  "zh-CN",
  "zh-HK",
  "zh-TW"
];

const fastlaneMetadataDirectory = path.join(
  __dirname,
  "..",
  "..",
  "fastlane/metadata"
);

async function renameDirectories( options ) {
  // Get all directories in fastlane/metadata/ios
  const iosDirectories = await fsp
    .readdir( path.join( fastlaneMetadataDirectory, "ios" ), {
      withFileTypes: true
    } )
    .then( files => files.filter( file => file.isDirectory() ).map( file => file.name ) );
  await Promise.all(
    iosDirectories.map( async directory => {
      const locale = CROWDIN_TO_APP_STORE_MAPPINGS[directory];
      if ( !locale ) return;
      const directoryPath = path.join( fastlaneMetadataDirectory, "ios", directory );
      const newDirectoryPath = path.join( fastlaneMetadataDirectory, "ios", locale );
      // Remove a potentially existing directory with the same name
      try {
        await fsp.rmdir( newDirectoryPath, { recursive: true } );
        if ( options.verbose ) {
          console.log( "Removed existing directory", newDirectoryPath );
        }
      } catch ( e ) {
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
    .readdir( path.join( fastlaneMetadataDirectory, "android" ), {
      withFileTypes: true
    } )
    .then( files => files.filter( file => file.isDirectory() ).map( file => file.name ) );
  return Promise.all(
    androidDirectories.map( async directory => {
      const locale = CROWDIN_TO_GOOGLE_PLAY_MAPPINGS[directory];
      if ( !locale ) return;
      const directoryPath = path.join( fastlaneMetadataDirectory, "android", directory );
      const newDirectoryPath = path.join( fastlaneMetadataDirectory, "android", locale );
      // Remove a potentially existing directory with the same name
      try {
        await fsp.rmdir( newDirectoryPath, { recursive: true } );
        if ( options.verbose ) {
          console.log( "Removed existing directory", newDirectoryPath );
        }
      } catch ( e ) {
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

async function removeUnsupportedDirectories( options ) {
  // Get all directories in fastlane/metadata/ios
  const iosDirectories = await fsp
    .readdir( path.join( fastlaneMetadataDirectory, "ios" ), {
      withFileTypes: true
    } )
    .then( files => files.filter( file => file.isDirectory() ).map( file => file.name ) );
  await Promise.all(
    iosDirectories.map( async directory => {
      if ( SUPPORTED_APP_STORE_LOCALES.indexOf( directory ) >= 0 ) return;
      const directoryPath = path.join( fastlaneMetadataDirectory, "ios", directory );
      if ( options.verbose ) {
        console.log( "Removing unsupported directory", directoryPath );
      }
      await fsp.rmdir( directoryPath, { recursive: true } );
    } )
  );
  const androidDirectories = await fsp
    .readdir( path.join( fastlaneMetadataDirectory, "android" ), {
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
      const directoryPath = path.join( fastlaneMetadataDirectory, "android", directory );
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
async function copyAndroidTitle( options ) {
  // Get all directories in fastlane/metadata/android
  const androidDirectories = await fsp
    .readdir( path.join( fastlaneMetadataDirectory, "android" ), {
      withFileTypes: true
    } )
    .then( files => files.filter( file => file.isDirectory() ).map( file => file.name ) );
  // Copy title.txt from en-US directory into all the other directories
  const titlePath = path.join( fastlaneMetadataDirectory, "android", "en-US", "title.txt" );
  await Promise.all(
    androidDirectories.map( async directory => {
      const directoryPath = path.join( fastlaneMetadataDirectory, "android", directory );
      if ( options.verbose ) {
        console.log( "Copying title.tx into: ", directoryPath );
      }
      await fsp.copyFile( titlePath, path.join( directoryPath, "title.txt" ) );
    } )
  );
}

// Prepends an FTL translation with a checkmark for testing
function checkifyText( ftlTxt ) {
  if ( ftlTxt.indexOf( "<0>" ) >= 0 ) {
    return ftlTxt.replace( "<0>", "<0>✅" );
  }
  return `✅${ftlTxt}`;
}

// This will create a version of localizations that has a ✅ in
// front of all text, as a way to see if there are untranslated strings
function checkifyLocalizations( localizations ) {
  // Mostly date format strings that will break with extra stuff in them
  const keysToSkip = [
    "date-month-year",
    "Date-short-format",
    "Date-this-year",
    "date-format-short",
    "datetime-format-short"
  ];
  return Object.keys( localizations ).reduce( ( memo, key ) => {
    memo[key] = localizations[key];
    if ( keysToSkip.indexOf( key ) >= 0 ) {
      return memo;
    }
    if ( memo[key].val ) {
      memo[key].val = checkifyText( memo[key].val );
    } else {
      memo[key] = checkifyText( memo[key] );
    }
    return memo;
  }, {} );
}

// Paths to all existing localizations
async function l10nFtlPaths() {
  return glob( path.join( __dirname, "l10n", "*.ftl" ) );
}

// Convert a single FTL file to JSON
const jsonifyPath = async ( inPath, outPath, options = { } ) => {
  let ftlTxt;
  try {
    ftlTxt = await fsp.readFile( inPath );
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
  fluent.ftl2js[util.promisify.custom] = (
    str,
    params = {}
  ) => new Promise( ( resolve, reject ) => {
    fluent.ftl2js(
      str,
      ( err, res ) => {
        if ( err ) {
          reject( err );
        } else {
          resolve( res );
        }
      },
      params
    );
  } );
  const ftl2js = util.promisify( fluent.ftl2js );
  const localizations = await ftl2js( ftlTxt.toString( ), { respectComments: false } );
  const massagedLocalizations = options.checkify
    ? checkifyLocalizations( localizations )
    : localizations;
  try {
    await fsp.writeFile( outPath, `${JSON.stringify( massagedLocalizations, null, 2 )}\n` );
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
  const paths = await l10nFtlPaths( );
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
  out.write( "\n" );
  out.write( "export const SUPPORTED_LOCALES = [\n" );
  out.write( locales.sort( ).map( l => `  "${l}"` ).join( ",\n" ) );
  out.write( "\n];\n" );
};

function isTranslationContainingDateFormat( item ) {
  if ( item.type !== "Message" ) {
    return false;
  }

  if ( item.id.name.startsWith( "date-format" ) ) {
    return true;
  }

  return item.id.name.startsWith( "datetime-format" );
}

async function validateFtlFile( ftlPath, options = {} ) {
  const ftlTxt = await fsp.readFile( ftlPath );
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
    if ( isTranslationContainingDateFormat( item ) ) {
      item.value.elements.forEach( textElement => {
        try {
          format( parseISO( "1970-01-01T00:00:00Z" ), textElement.value, {
            locale: enUS
          } );
        } catch ( error ) {
          errors.push( `${item.id.name} = ${textElement.value}: ${error.message}` );
        }
      } );
    }
  } );
  if ( errors.length > 0 ) {
    console.error( `❌ ${errors.length} errors found in ${ftlPath}:` );
    errors.forEach( error => {
      console.error( chalk.red( "[Error]" ), error );
    } );
    if ( options.noExit ) {
      return false;
    }
    process.exit( 1 );
  }
  if ( !options.quiet ) {
    console.log( `✅ ${ftlPath} validated` );
  }
  return true;
}

async function validate() {
  // Validate source strings
  await validateFtlFile( path.join( __dirname, "strings.ftl" ) );
  // Validate translations
  const l10nPaths = await l10nFtlPaths( );
  const results = await Promise.allSettled( l10nPaths.map(
    ftlPath => validateFtlFile( ftlPath, { quiet: true, noExit: true } )
  ) );
  if ( results.find( r => r.value === false ) ) {
    process.exit( 1 );
  } else {
    console.log( "✅ l10n FTL validated" );
  }
}

async function normalizeFtlFile( ftlPath, options = {} ) {
  const isSource = !ftlPath.match( /l10n/ );
  const ftlTxt = await fsp.readFile( ftlPath );
  const ftl = parseFtl( ftlTxt.toString( ) );
  const resourceComments = [];
  const messages = [];
  // Extract the elements that matter
  ftl.body.forEach( item => {
    if ( isSource && item.type === "ResourceComment" ) resourceComments.push( item );
    if ( item.type === "Message" ) {
      if ( !isSource ) item.comment = null;
      messages.push( item );
    }
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
  let newFtlTxt = serializeFtl( newResource );
  if ( !isSource ) {
    const warning = `
### DO NOT EDIT THIS FILE!
###
### This file came from Crowdin and was normalized by ${path.basename( __filename )}.
### It will be overwritten during the next translation sync. To add
### translations, go to https://crowdin.com/editor/inaturalistios/724
###`.trim();
    newFtlTxt = `${warning}\n\n${newFtlTxt}`;
  }
  await fsp.writeFile( ftlPath, newFtlTxt );
  if ( !options.quiet ) {
    console.log( `✅ ${ftlPath} normalized` );
  }
}

async function normalize( ) {
  await normalizeFtlFile( path.join( __dirname, "strings.ftl" ) );
  const l10nPaths = await l10nFtlPaths( );
  await Promise.all( l10nPaths.map( ftlPath => normalizeFtlFile( ftlPath, { quiet: true } ) ) );
  console.log( "✅ l10n FTL normalized" );
}

async function getKeys( ) {
  const stringsPath = path.join( __dirname, "strings.ftl" );
  const ftlTxt = await fsp.readFile( stringsPath );
  const ftl = parseFtl( ftlTxt.toString( ) );
  return ftl.body.filter( item => item.type === "Message" ).map( msg => msg.id.name );
}

async function getKeysInUse( ) {
  const paths = await glob( path.join( __dirname, "..", "**", "*.{js,ts,jsx,tsx}" ) );
  const allKeys = await Promise.all( paths.map( async srcPath => {
    const src = await fsp.readFile( srcPath );
    const tMatches = [...src.toString( ).matchAll( /[^a-z]t\(\s*["']([\w-_\s]+?)["']/g )];
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

// Look for keys in the code that aren't in the source strings
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

// Ensure localization file names match iNat convention and not Crowdin, e.g.
// we use "fr" instead of "fr-FR"
async function normalizeFileNames( ) {
  const paths = await l10nFtlPaths();
  return Promise.all( paths.map( async l10nPath => {
    const locale = path.basename( l10nPath, ".ftl" );
    const [lng, region] = locale.split( "-" );
    // No need to move anything if there's no region
    if ( !region ) return;

    // We need to keep some regions
    if ( SUPPORTED_REGIONAL_LOCALES.indexOf( locale ) >= 0 ) return;

    // Everything else needs to be regionless
    const newPath = path.join( path.dirname( l10nPath ), `${lng}.ftl` );
    await fsp.rename( l10nPath, newPath );
  } ) );
}

// eslint-disable-next-line no-unused-expressions
yargs
  .usage( "Usage: $0 <cmd> [args]" )
  .option( "verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging"
  } )
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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ( ) => {},
    ( ) => writeLoadTranslations( )
  )
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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ( ) => {},
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
    "normalize",
    "Normalize source strings",
    ( ) => undefined,
    _argv => {
      normalize( );
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
  // TODO make commands that look for untranslated strings and translated
  // strings that are no longer in use
  .command(
    "prepareFastlaneMetadataDirectories",
    "Prepare existing localizations for uploading metadata",
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
