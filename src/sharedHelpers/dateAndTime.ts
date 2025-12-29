// Helpers for working with dates

// Note: this is a collection of reusable helpers. Please don't give them
// names that are specific to particular views,
// like "myObsDateFormat"

import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
  formatISO,
  fromUnixTime,
  getUnixTime,
  getYear,
  parse,
  parseISO,
} from "date-fns";
import {
  ar,
  be,
  bg,
  // br,
  ca,
  cs,
  da,
  de,
  el,
  // en,
  enGB,
  enIN,
  enNZ,
  enUS,
  eo,
  es,
  // esAR,
  // esCO,
  // esCR,
  // esMX,
  et,
  eu,
  fi,
  fr,
  frCA,
  gl,
  he,
  hr,
  hu,
  id,
  it,
  ja,
  ka,
  kk,
  kn,
  ko,
  lb,
  lt,
  lv,
  // mi,
  mk,
  // mr,
  nb,
  nl,
  oc,
  pl,
  pt,
  ptBR,
  ru,
  // sat,
  sk,
  sl,
  sq,
  sr,
  sv,
  th,
  tr,
  uk,
  zhCN,
  zhTW,
} from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import type { i18n as i18next } from "i18next";

// Convert iNat locale to date-fns locale. Note that coverage is *not*
// complete, so some locales will see dates formatted in a nearby locale,
// e.g. Breton users will see French dates, including French month
// abbreviations. The only solution is to contribute new locales to date-fns:
// https://date-fns.org/v4.1.0/docs/I18n-Contribution-Guide
function dateFnsLocale( i18nextLanguage: string ) {
  switch ( i18nextLanguage ) {
    case "ar":
      return ar;
    case "be":
      return be;
    case "bg":
      return bg;
    case "br":
      // Assuming Breton uses the same date format as France
      return fr;
    case "ca":
      return ca;
    case "cs":
      return cs;
    case "da":
      return da;
    case "de":
      return de;
    case "el":
      return el;
    case "en":
      return enUS;
    case "en-GB":
      return enGB;
    case "eo":
      return eo;
    case "es":
      return es;
    case "es-AR":
      // date-fns doesn't have New World Spanish date formats, so we'll see how this goes
      return es;
    case "es-CO":
      // date-fns doesn't have New World Spanish date formats, so we'll see how this goes
      return es;
    case "es-CR":
      // date-fns doesn't have New World Spanish date formats, so we'll see how this goes
      return es;
    case "es-MX":
      // date-fns doesn't have New World Spanish date formats, so we'll see how this goes
      return es;
    case "et":
      return et;
    case "eu":
      return eu;
    case "fi":
      return fi;
    case "fr":
      return fr;
    case "fr-CA":
      return frCA;
    case "gl":
      return gl;
    case "he":
      return he;
    case "hr":
      return hr;
    case "hu":
      return hu;
    case "id":
      return id;
    case "it":
      return it;
    case "ja":
      return ja;
    case "ka":
      return ka;
    case "kk":
      return kk;
    case "kn":
      return kn;
    case "ko":
      return ko;
    case "lb":
      return lb;
    case "lt":
      return lt;
    case "lv":
      return lv;
    case "mi":
      // No support for Maori yet
      return enNZ;
    case "mk":
      return mk;
    case "mr":
      // No support for Marathi yet
      return enIN;
    case "nb":
      return nb;
    case "nl":
      return nl;
    case "oc":
      return oc;
    case "pl":
      return pl;
    case "pt":
      return pt;
    case "pt-BR":
      return ptBR;
    case "ru":
      return ru;
    case "sat":
      // No support for Santali yet
      return enIN;
    case "sk":
      return sk;
    case "sl":
      return sl;
    case "sq":
      return sq;
    case "sr":
      return sr;
    case "sv":
      return sv;
    case "th":
      return th;
    case "tr":
      return tr;
    case "uk":
      return uk;
    case "zh-CN":
      return zhCN;
    case "zh-TW":
      return zhTW;
    default:
      return enUS;
  }
}

function formatISONoTimezone( date: Date ) {
  if ( !date ) {
    return "";
  }
  const formattedISODate = formatISO( date );
  if ( !formattedISODate ) {
    return "";
  }
  // Always take the first part of the time/date string,
  // without any extra timezone, etc (just "2022-12-31T23:59:59")
  return formattedISODate.substring( 0, 19 );
}

// two options for observed_on_string in uploader are:
// 2020-03-01 00:00 or 2021-03-24T14:40:25
// this is using the second format
// https://github.com/inaturalist/inaturalist/blob/b12f16099fc8ad0c0961900d644507f6952bec66/spec/controllers/observation_controller_api_spec.rb#L161
function formatDateStringFromTimestamp( timestamp: number ) {
  if ( !timestamp ) {
    return "";
  }
  const date = fromUnixTime( timestamp );
  return formatISONoTimezone( date );
}

function getNowISO( ) {
  return formatDateStringFromTimestamp(
    getUnixTime( new Date( ) ),
  );
}

// Some components, like DatePicker, do not support seconds, so we're
// returning a date, without timezone and without seconds
// (just "2022-12-31T23:59")
function formatISONoSeconds( date: Date ) {
  const isoDate = formatISO( date );
  const isoDateNoSeconds = isoDate.substring( 0, 16 );
  return isoDateNoSeconds;
}

function formatDifferenceForHumans( date: Date | string, i18n: i18next ) {
  const d = typeof date === "string"
    ? parseISO( date )
    : new Date( date );
  const now = new Date();

  const days = differenceInDays( now, d );

  if ( days <= 30 ) {
    // Less than 30 days ago - display as 3m (mins), 3h (hours), 3d (days) or 3w (weeks)
    if ( days < 1 ) {
      const hours = differenceInHours( now, d );
      if ( hours < 1 ) {
        const minutes = differenceInMinutes( now, d );
        return i18n.t( "datetime-difference-minutes", { count: minutes } );
      }
      return i18n.t( "datetime-difference-hours", { count: hours } );
    } if ( days < 7 ) {
      return i18n.t( "datetime-difference-days", { count: days } );
    }
    return i18n.t( "datetime-difference-weeks", { count: Math.floor( days / 7 ) } );
  }
  const formatOpts = { locale: dateFnsLocale( i18n.language ) };
  if ( getYear( now ) !== getYear( d ) ) {
    // Previous year(s)
    return format( d, i18n.t( "date-format-short" ), formatOpts );
  }
  // Current year
  return format( d, i18n.t( "date-format-month-day" ), formatOpts );
}

interface FormatDateStringOptions {
  // Display the time as literally expressed in the dateString, i.e. don't
  // assume it's in any time zone
  literalTime?: boolean;
  // Text to show if date is missing
  missing?: string | null;
  // IANA time zone name
  timeZone?: string;
}

type DateString = string | null;

function formatDateString(
  dateString: DateString,
  fmt: string,
  i18n: i18next,
  options: FormatDateStringOptions = { },
) {
  if ( !dateString || dateString === "" ) {
    return options.missing === undefined
      ? i18n.t( "Missing-Date" )
      : options.missing;
  }
  let timeZone = (
    // If we received a time zone, display the time in the requested zone
    options.timeZone
    // Otherwise use the system / local time zone
    || Intl.DateTimeFormat( ).resolvedOptions( ).timeZone
  );
  let isoDateString = dateString;
  if ( options.literalTime ) {
    isoDateString = dateString.replace( /[+-]\d\d:\d\d/, "" );
    isoDateString = isoDateString.replace( "Z", "" );
    // eslint-disable-next-line prefer-destructuring
    timeZone = Intl.DateTimeFormat( ).resolvedOptions( ).timeZone;
  }

  try {
    return formatInTimeZone(
      parseISO( isoDateString ),
      timeZone,
      fmt,
      { locale: dateFnsLocale( i18n.language ) },
    );
  } catch ( error ) {
    console.warn( "Error formatting date", error );
    // In case of: RangeError: Incorrect timeZone information provided
    if ( error instanceof RangeError ) {
      // Remove timezone (zzz) from format string
      fmt = fmt.replace( / zzz/g, "" );
      return format(
        parseISO( isoDateString ),
        fmt,
        { locale: dateFnsLocale( i18n.language ) },
      );
    }
    return i18n.t( "Missing-Date" );
  }
}

function formatMonthYearDate(
  dateString: DateString,
  i18n: i18next,
  options: FormatDateStringOptions = {},
) {
  return formatDateString( dateString, i18n.t( "date-format-month-year" ), i18n, options );
}

function formatLongDate(
  dateString: DateString,
  i18n: i18next,
  options: FormatDateStringOptions = {},
) {
  return formatDateString( dateString, i18n.t( "date-format-long" ), i18n, options );
}

function formatLongDatetime(
  dateString: DateString,
  i18n: i18next,
  options: FormatDateStringOptions = {},
) {
  const fmt = options.literalTime && !options.timeZone
    ? i18n.t( "datetime-format-long" )
    : i18n.t( "datetime-format-long-with-zone" );
  return formatDateString( dateString, fmt, i18n, options );
}

function formatApiDatetime(
  dateString: DateString,
  i18n: i18next,
  options: FormatDateStringOptions = {},
) {
  const hasTime = String( dateString ).includes( "T" );
  if ( hasTime ) {
    return formatDateString(
      dateString,
      options.literalTime && !options.timeZone
        ? i18n.t( "datetime-format-short" )
        : i18n.t( "datetime-format-short-with-zone" ),
      i18n,
      options,
    );
  }
  return formatDateString(
    dateString,
    i18n.t( "date-format-short" ),
    i18n,
    options,
  );
}

// in the future, would be great to have the backend team return a single type of format
// from the API so we don't have to handle all of this on the client side.
// right now date formats for projects include the following types, so if we're not
// manipulating a date type correctly it can cause [RangeError: Invalid time value] crashes
// Apr 28, 2025
// April 28, 2025
// 2025-04-28
// 2025-04-28 11:33 -04:00
function formatProjectsApiDatetimeLong(
  dateString: DateString,
  i18n: i18next,
  options: FormatDateStringOptions = {},
) {
  const hasTime = String( dateString ).includes( "T" );
  if ( hasTime ) {
    return formatDateString( dateString, i18n.t( "datetime-format-long" ), i18n, options );
  }
  if ( dateString?.includes( "/" ) ) {
    // Convert from 2025/08/01 to 2025-08-01, so the date parsing function won't crash
    dateString = dateString.replace( /\//g, "-" );
  }
  const hasTimezoneOffset = String( dateString ).includes( ":" );
  if ( hasTimezoneOffset ) {
    const dateWithoutOffset = dateString.split( " " )[0];
    return formatDateString(
      dateWithoutOffset,
      i18n.t( "date-format-long" ),
      i18n,
      options,
    );
  }
  const hasComma = String( dateString ).includes( "," );
  if ( hasComma ) {
    const parsedDate = parse( dateString, "MMMM d, yyyy", new Date( ) );

    return formatDateString(
      formatISO( parsedDate ),
      i18n.t( "date-format-long" ),
      i18n,
      options,
    );
  }

  return formatDateString( dateString, i18n.t( "date-format-long" ), i18n, options );
}

export {
  formatApiDatetime,
  formatDateStringFromTimestamp,
  formatDifferenceForHumans,
  formatISONoSeconds,
  formatISONoTimezone,
  formatLongDate,
  formatLongDatetime,
  formatMonthYearDate,
  formatProjectsApiDatetimeLong,
  getNowISO,
};
