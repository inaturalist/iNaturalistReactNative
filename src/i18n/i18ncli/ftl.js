/* eslint no-console: 0 */

import {
  parse as parseFtl,
  Resource,
  serialize as serializeFtl
} from "@fluent/syntax";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import fluent from "fluent_conv";
import fs from "fs";
import fsp from "fs/promises";
import { glob } from "glob";
import {
  difference,
  flatten,
  sortBy,
  uniq
} from "lodash";
import path from "path";
import util from "util";

const I18N_BASE_PATH = path.join( __dirname, ".." );

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
  return glob( path.join( I18N_BASE_PATH, "l10n", "*.ftl" ) );
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
    path.join( I18N_BASE_PATH, "strings.ftl" ),
    path.join( I18N_BASE_PATH, "l10n", "en.ftl" )
  );
  // For each locale, convert the .ftl files to .ftl.json files
  await Promise.all( locales.map( async locale => {
    const inPath = path.join( I18N_BASE_PATH, "l10n", `${locale}.ftl` );
    const outPath = path.join( I18N_BASE_PATH, "l10n", `${locale}.ftl.json` );
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
  await validateFtlFile( path.join( I18N_BASE_PATH, "strings.ftl" ) );
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
  await normalizeFtlFile( path.join( I18N_BASE_PATH, "strings.ftl" ) );
  const l10nPaths = await l10nFtlPaths( );
  await Promise.all( l10nPaths.map( ftlPath => normalizeFtlFile( ftlPath, { quiet: true } ) ) );
  console.log( "✅ l10n FTL normalized" );
}

async function getKeys( ) {
  const stringsPath = path.join( I18N_BASE_PATH, "strings.ftl" );
  const ftlTxt = await fsp.readFile( stringsPath );
  const ftl = parseFtl( ftlTxt.toString( ) );
  return ftl.body.filter( item => item.type === "Message" ).map( msg => msg.id.name );
}

async function getKeysInUse( ) {
  const paths = await glob( path.join( I18N_BASE_PATH, "..", "**", "*.{js,ts,jsx,tsx}" ) );
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

export {
  jsonifyLocalizations,
  normalize,
  normalizeFileNames,
  supportedLocales,
  untranslatable,
  unused,
  validate
};
