// TODO rename methods so they're reusable
// TODO replace const functions w/ keyword functions
// TODO redo in typescript
// TODO rename all format translation keys to be date-format-* or datetime-format-*
// Make sure all format strings have URL to formatting options
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
  formatISO,
  fromUnixTime,
  getUnixTime,
  getYear,
  parseISO
} from "date-fns";
import {
  ar,
  be,
  bg,
  br,
  ca,
  cs,
  da,
  de,
  el,
  en,
  enGB,
  eo,
  es,
  esAR,
  esCO,
  esCR,
  esMX,
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
  mi,
  mk,
  mr,
  nb,
  nl,
  oc,
  pl,
  pt,
  ptBR,
  ru,
  sat,
  sk,
  sl,
  sq,
  sr,
  sv,
  th,
  tr,
  uk,
  zhCN,
  zhTW
} from "date-fns/locale";

function dateFnsLocale( i18nextLanguage ) {
  switch ( i18nextLanguage ) {
    case "ar":
      return ar;
    case "be":
      return be;
    case "bg":
      return bg;
    case "br":
      return br;
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
      return en;
    case "en-GB":
      return enGB;
    case "eo":
      return eo;
    case "es":
      return es;
    case "es-AR":
      return esAR;
    case "es-CO":
      return esCO;
    case "es-CR":
      return esCR;
    case "es-MX":
      return esMX;
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
      return mi;
    case "mk":
      return mk;
    case "mr":
      return mr;
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
      return sat;
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
      return en;
  }
}

const formatISONoTimezone = date => {
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
};

// two options for observed_on_string in uploader are:
// 2020-03-01 00:00 or 2021-03-24T14:40:25
// this is using the second format
// https://github.com/inaturalist/inaturalist/blob/b12f16099fc8ad0c0961900d644507f6952bec66/spec/controllers/observation_controller_api_spec.rb#L161
const formatDateStringFromTimestamp = timestamp => {
  if ( !timestamp ) {
    return "";
  }
  const date = fromUnixTime( timestamp );
  return formatISONoTimezone( date );
};

const createObservedOnStringForUpload = date => formatDateStringFromTimestamp(
  getUnixTime( date || new Date( ) )
);

const createObservedOnStringFromDatePicker = date => {
  // DatePicker does not support seconds, so we're returning a date,
  // without timezone and without seconds (just "2022-12-31T23:59")
  const isoDate = formatISO( date );
  const isoDateNoSeconds = isoDate.substring( 0, 16 );
  return isoDateNoSeconds;
};

const formatIdDate = ( date, i18n ) => {
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
        return i18n.t( "Date-minutes", { count: minutes } );
      }
      return i18n.t( "Date-hours", { count: hours } );
    } if ( days < 7 ) {
      return i18n.t( "Date-days", { count: days } );
    }
    return i18n.t( "Date-weeks", { count: parseInt( days / 7, 10 ) } );
  }
  const formatOpts = { locale: dateFnsLocale( i18n.language ) };
  if ( getYear( now ) !== getYear( d ) ) {
    // Previous year(s)
    return format( d, i18n.t( "Date-short-format" ), formatOpts );
  }
  // Current year
  return format( d, i18n.t( "Date-this-year" ), formatOpts );
};

function formatDateString( dateString, fmt, i18n, options = {} ) {
  if ( !dateString || dateString === "" ) {
    return options.missing === undefined
      ? i18n.t( "Missing-Date" )
      : options.missing;
  }
  return format(
    parseISO( dateString ),
    fmt,
    { locale: dateFnsLocale( i18n.language ) }
  );
}

function formatMonthYearDate( dateString, i18n ) {
  return formatDateString( dateString, i18n.t( "date-month-year" ), i18n );
}

function formatLongDate( dateString, i18n ) {
  return formatDateString( dateString, i18n.t( "date-format-long" ), i18n );
}

function displayDateTimeObsEdit( dateString, i18n, options = {} ) {
  return formatDateString( dateString, "Pp", i18n, options );
}

function formatApiDatetime( dateString, i18n ) {
  const hasTime = String( dateString ).includes( "T" );
  if ( hasTime ) {
    return formatDateString( dateString, i18n.t( "datetime-format-short" ), i18n );
  }
  return formatDateString( dateString, i18n.t( "date-format-short" ), i18n );
}

export {
  createObservedOnStringForUpload,
  createObservedOnStringFromDatePicker,
  displayDateTimeObsEdit,
  formatApiDatetime,
  formatDateStringFromTimestamp,
  formatIdDate,
  formatISONoTimezone,
  formatLongDate,
  formatMonthYearDate
};
