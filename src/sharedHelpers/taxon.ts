import _ from "lodash";

const uncapitalized = new Set( [
  "à",
  "a",
  "and",
  "atau", // Indonesian
  "con",
  "da",
  "dal",
  "dan", // Indonesian
  "de",
  "dei",
  "del",
  "des",
  "di",
  "du",
  "e",
  "in",
  "la",
  "o",
  "of",
  "on",
  "the"
] );

const capitalize = ( s: string ) => {
  if ( !s ) {
    return s;
  }
  // eslint-disable-next-line max-len
  const lowerCaseChars = "\u{B5}\u{DF}\u{E0}\u{E1}\u{E2}\u{E3}\u{E4}\u{E5}\u{E6}\u{E7}\u{E8}\u{E9}\u{EA}\u{EB}\u{EC}\u{ED}\u{EE}\u{EF}\u{F0}\u{F1}\u{F2}\u{F3}\u{F4}\u{F5}\u{F6}\u{F8}\u{D8}\u{F9}\u{FA}\u{FB}\u{FC}\u{FD}\u{FE}\u{FF}\u{101}\u{103}\u{105}\u{107}\u{109}\u{10B}\u{10D}\u{10F}\u{113}\u{115}\u{117}\u{119}\u{11B}\u{11D}\u{11F}\u{121}\u{123}\u{125}\u{129}\u{12B}\u{12D}\u{12F}\u{135}\u{137}\u{13A}\u{13C}\u{13E}\u{142}\u{144}\u{146}\u{148}\u{14D}\u{14F}\u{151}\u{152}\u{153}\u{155}\u{157}\u{159}\u{15B}\u{15D}\u{15F}\u{161}\u{163}\u{165}\u{169}\u{16B}\u{16D}\u{16F}\u{171}\u{173}\u{175}\u{177}\u{17A}\u{17C}\u{17E}\u{1A1}\u{1B0}\u{1CE}\u{1D0}\u{1D2}\u{1D4}\u{1D6}\u{1D8}\u{1DA}\u{1DC}\u{1DF}\u{1E1}\u{1E3}\u{1E7}\u{1E9}\u{1EB}\u{1ED}\u{1EF}\u{1F0}\u{1F5}\u{1F9}\u{1FB}\u{1FD}\u{1FF}\u{201}\u{203}\u{205}\u{207}\u{209}\u{20B}\u{20D}\u{20F}\u{211}\u{213}\u{215}\u{217}\u{219}\u{21B}\u{21F}\u{227}\u{229}\u{22B}\u{22D}\u{22F}\u{231}\u{233}\u{3A9}\u{1E01}\u{1E03}\u{1E05}\u{1E07}\u{1E09}\u{1E0B}\u{1E0D}\u{1E0F}\u{1E11}\u{1E13}\u{1E15}\u{1E17}\u{1E19}\u{1E1B}\u{1E1D}\u{1E1F}\u{1E21}\u{1E23}\u{1E25}\u{1E27}\u{1E29}\u{1E2B}\u{1E2D}\u{1E2F}\u{1E31}\u{1E33}\u{1E35}\u{1E37}\u{1E39}\u{1E3B}\u{1E3D}\u{1E3F}\u{1E41}\u{1E43}\u{1E45}\u{1E47}\u{1E49}\u{1E4B}\u{1E4D}\u{1E4F}\u{1E51}\u{1E53}\u{1E55}\u{1E57}\u{1E59}\u{1E5B}\u{1E5D}\u{1E5F}\u{1E61}\u{1E63}\u{1E65}\u{1E67}\u{1E69}\u{1E6B}\u{1E6D}\u{1E6F}\u{1E71}\u{1E73}\u{1E75}\u{1E77}\u{1E79}\u{1E7B}\u{1E7D}\u{1E7F}\u{1E81}\u{1E83}\u{1E85}\u{1E87}\u{1E89}\u{1E8B}\u{1E8D}\u{1E8F}\u{1E91}\u{1E93}\u{1E95}\u{1E96}\u{1E97}\u{1E98}\u{1E99}\u{1E9B}\u{1EA1}\u{1EA3}\u{1EA5}\u{1EA7}\u{1EA9}\u{1EAB}\u{1EAD}\u{1EAF}\u{1EB1}\u{1EB3}\u{1EB5}\u{1EB7}\u{1EB9}\u{1EBB}\u{1EBD}\u{1EBF}\u{1EC1}\u{1EC3}\u{1EC5}\u{1EC7}\u{1EC9}\u{1ECB}\u{1ECD}\u{1ECF}\u{1ED1}\u{1ED3}\u{1ED5}\u{1ED7}\u{1ED9}\u{1EDB}\u{1EDD}\u{1EDF}\u{1EE1}\u{1EE3}\u{1EE5}\u{1EE7}\u{1EE9}\u{1EEB}\u{1EED}\u{1EEF}\u{1EF1}\u{1EF3}\u{1EF5}\u{1EF7}\u{1EF9}\u{2202}\u{2206}\u{2211}\u{FB01}\u{FB02}";
  // On the web, we use toUpperCase to generate this at runtime, but that
  // seems to be causing a bug in the Android JS engine as of 20230110, so
  // we're hard-coding it here. ~~~kueda 20220110
  // eslint-disable-next-line max-len
  const upperCaseChars = "\u{39C}\u{DF}\u{C0}\u{C1}\u{C2}\u{C3}\u{C4}\u{C5}\u{C6}\u{C7}\u{C8}\u{C9}\u{CA}\u{CB}\u{CC}\u{CD}\u{CE}\u{CF}\u{D0}\u{D1}\u{D2}\u{D3}\u{D4}\u{D5}\u{D6}\u{D8}\u{D8}\u{D9}\u{DA}\u{DB}\u{DC}\u{DD}\u{DE}\u{178}\u{100}\u{102}\u{104}\u{106}\u{108}\u{10A}\u{10C}\u{10E}\u{112}\u{114}\u{116}\u{118}\u{11A}\u{11C}\u{11E}\u{120}\u{122}\u{124}\u{128}\u{12A}\u{12C}\u{12E}\u{134}\u{136}\u{139}\u{13B}\u{13D}\u{141}\u{143}\u{145}\u{147}\u{14C}\u{14E}\u{150}\u{152}\u{152}\u{154}\u{156}\u{158}\u{15A}\u{15C}\u{15E}\u{160}\u{162}\u{164}\u{168}\u{16A}\u{16C}\u{16E}\u{170}\u{172}\u{174}\u{176}\u{179}\u{17B}\u{17D}\u{1A0}\u{1AF}\u{1CD}\u{1CF}\u{1D1}\u{1D3}\u{1D5}\u{1D7}\u{1D9}\u{1DB}\u{1DE}\u{1E0}\u{1E2}\u{1E6}\u{1E8}\u{1EA}\u{1EC}\u{1EE}J\u{30C}\u{1F4}\u{1F8}\u{1FA}\u{1FC}\u{1FE}\u{200}\u{202}\u{204}\u{206}\u{208}\u{20A}\u{20C}\u{20E}\u{210}\u{212}\u{214}\u{216}\u{218}\u{21A}\u{21E}\u{226}\u{228}\u{22A}\u{22C}\u{22E}\u{230}\u{232}\u{3A9}\u{1E00}\u{1E02}\u{1E04}\u{1E06}\u{1E08}\u{1E0A}\u{1E0C}\u{1E0E}\u{1E10}\u{1E12}\u{1E14}\u{1E16}\u{1E18}\u{1E1A}\u{1E1C}\u{1E1E}\u{1E20}\u{1E22}\u{1E24}\u{1E26}\u{1E28}\u{1E2A}\u{1E2C}\u{1E2E}\u{1E30}\u{1E32}\u{1E34}\u{1E36}\u{1E38}\u{1E3A}\u{1E3C}\u{1E3E}\u{1E40}\u{1E42}\u{1E44}\u{1E46}\u{1E48}\u{1E4A}\u{1E4C}\u{1E4E}\u{1E50}\u{1E52}\u{1E54}\u{1E56}\u{1E58}\u{1E5A}\u{1E5C}\u{1E5E}\u{1E60}\u{1E62}\u{1E64}\u{1E66}\u{1E68}\u{1E6A}\u{1E6C}\u{1E6E}\u{1E70}\u{1E72}\u{1E74}\u{1E76}\u{1E78}\u{1E7A}\u{1E7C}\u{1E7E}\u{1E80}\u{1E82}\u{1E84}\u{1E86}\u{1E88}\u{1E8A}\u{1E8C}\u{1E8E}\u{1E90}\u{1E92}\u{1E94}H\u{331}T\u{308}W\u{30A}Y\u{30A}\u{1E60}\u{1EA0}\u{1EA2}\u{1EA4}\u{1EA6}\u{1EA8}\u{1EAA}\u{1EAC}\u{1EAE}\u{1EB0}\u{1EB2}\u{1EB4}\u{1EB6}\u{1EB8}\u{1EBA}\u{1EBC}\u{1EBE}\u{1EC0}\u{1EC2}\u{1EC4}\u{1EC6}\u{1EC8}\u{1ECA}\u{1ECC}\u{1ECE}\u{1ED0}\u{1ED2}\u{1ED4}\u{1ED6}\u{1ED8}\u{1EDA}\u{1EDC}\u{1EDE}\u{1EE0}\u{1EE2}\u{1EE4}\u{1EE6}\u{1EE8}\u{1EEA}\u{1EEC}\u{1EEE}\u{1EF0}\u{1EF2}\u{1EF4}\u{1EF6}\u{1EF8}\u{2202}\u{2206}\u{2211}\u{FB01}\u{FB02}";
  // I don't feel great about disabling this eslint check, but the this
  // approach does prevent the crash on Android. We should keep in mind that
  // there may be capitalization issues down the road ~~~kueda 20230110
  // eslint-disable-next-line no-misleading-character-class
  const allCasePattern = new RegExp(
    `[A-z${lowerCaseChars}${upperCaseChars}]`
  );
  const firstLetterMatch = s.match( allCasePattern );
  let firstLetterIndex = firstLetterMatch
    ? firstLetterMatch.index
    : 0;
  // eslint-disable-next-line no-misleading-character-class
  const leadingContractionPattern = new RegExp(
    `^[a-z${
      lowerCaseChars
    }][’']([A-z${
      lowerCaseChars
    }${upperCaseChars}]+)`
  );
  const leadingContractionMatch = s.match( leadingContractionPattern );
  if ( leadingContractionMatch ) {
    firstLetterIndex = s.indexOf( leadingContractionMatch[1] );
  }
  return (
    s.slice( 0, firstLetterIndex )
    + s[firstLetterIndex].toUpperCase()
    + s.slice( firstLetterIndex + 1 )
  );
};

export const capitalizeCommonName = ( name: string ) => {
  if ( !name ) {
    return name;
  }
  const commonNamePieces = _.trim( name ).split( /\s+/ );

  return _.map( commonNamePieces, ( piece, i ) => {
    const lowercasePiece = piece.toLowerCase();

    if ( i > 0 && uncapitalized.has( lowercasePiece ) ) {
      return lowercasePiece;
    }
    if ( i === commonNamePieces.length - 1 ) {
      if ( piece[0] === "-" ) {
        return lowercasePiece;
      }

      return piece
        .split( "-" )
        .map( s => {
          const splitPiece = s.toLowerCase();
          if ( uncapitalized.has( splitPiece ) ) {
            return splitPiece;
          }
          return capitalize( splitPiece );
        } )
        .join( "-" );
    }
    return capitalize( lowercasePiece );
  } ).join( " " );
};

interface Taxon {
  rank?: string;
  rank_level?: number;
  preferred_common_name?: string;
  name?: string;
}

interface TaxonDisplayData {
  rank?: string;
  rankLevel?: number;
  commonName?: string;
  rankPiece?: string;
  scientificNamePieces?: string[];
  scientificName?: string;
}

export const generateTaxonPieces = ( taxon: Taxon ): TaxonDisplayData => {
  const taxonDisplayData: Partial<TaxonDisplayData> = {};

  if ( taxon.rank ) taxonDisplayData.rank = capitalize( taxon.rank );
  taxonDisplayData.rankLevel = taxon.rank_level;

  // Logic follows the SplitTaxon component from web
  // https://github.com/inaturalist/inaturalist/blob/main/app/webpack/shared/components/split_taxon.jsx
  if ( taxon.preferred_common_name ) {
    // 20241111 amanda - this multiple lexicon code isn't part of the original web code for this,
    // found here, but is needed in iNat Next:
    // https://github.com/inaturalist/inaturalist/blob/c578c11d00ed97940f0b6d8aa0793b6afd765824/app/assets/javascripts/ang/models/taxon.js.erb#L155
    const multipleLexicons = taxon.preferred_common_name.split( "·" );
    taxonDisplayData.commonName = _.map(
      multipleLexicons,
      ( lexicon => capitalizeCommonName( lexicon )
      )
    ).join( " · " );
  }

  const scientificNamePieces = taxon?.name?.split( " " );
  if ( taxon.rank_level < 10 ) {
    if ( taxon.rank === "variety" ) {
      taxonDisplayData.rankPiece = "var.";
    } else if ( taxon.rank === "subspecies" ) {
      taxonDisplayData.rankPiece = "ssp.";
    } else if ( taxon.rank === "form" ) {
      taxonDisplayData.rankPiece = "f.";
    }

    if ( taxonDisplayData.rankPiece && scientificNamePieces ) {
      scientificNamePieces.splice( -1, 0, taxonDisplayData.rankPiece );
    }
  }

  taxonDisplayData.scientificNamePieces = scientificNamePieces;
  taxonDisplayData.scientificName = scientificNamePieces?.join( " " );

  return taxonDisplayData;
};

interface User {
  prefers_scientific_name_first?: boolean;
  prefers_common_names?: boolean;
}
export function accessibleTaxonName(
  taxon: Taxon,
  user: User | null,
  t: ( key: string, options: object ) => string
) {
  const { commonName, scientificName } = generateTaxonPieces( taxon );
  if ( typeof ( user?.prefers_scientific_name_first ) === "boolean" ) {
    if ( user.prefers_scientific_name_first ) {
      return t( "accessible-sciname-comname", { scientificName, commonName } );
    }
    if ( !user.prefers_common_names ) {
      return scientificName;
    }
  }
  return t( "accessible-comname-sciname", { scientificName, commonName } );
}

// Translates rank in a way that can be statically checked
export function translatedRank( rank: string, t: ( key: string ) => string ) {
  switch ( rank ) {
    case "Class":
      return t( "Ranks-Class" );
    case "Complex":
      return t( "Ranks-Complex" );
    case "Epifamily":
      return t( "Ranks-Epifamily" );
    case "Family":
      return t( "Ranks-Family" );
    case "Form":
      return t( "Ranks-Form" );
    case "Genus":
      return t( "Ranks-Genus" );
    case "Genushybrid":
      return t( "Ranks-Genushybrid" );
    case "Hybrid":
      return t( "Ranks-Hybrid" );
    case "Infraclass":
      return t( "Ranks-Infraclass" );
    case "Infrahybrid":
      return t( "Ranks-Infrahybrid" );
    case "Infraorder":
      return t( "Ranks-Infraorder" );
    case "Kingdom":
      return t( "Ranks-Kingdom" );
    case "Order":
      return t( "Ranks-Order" );
    case "Parvorder":
      return t( "Ranks-Parvorder" );
    case "Phylum":
      return t( "Ranks-Phylum" );
    case "Section":
      return t( "Ranks-Section" );
    case "Species":
      return t( "Ranks-Species" );
    case "Statefmatter":
      return t( "Ranks-Statefmatter" );
    case "Subclass":
      return t( "Ranks-Subclass" );
    case "Subfamily":
      return t( "Ranks-Subfamily" );
    case "Subgenus":
      return t( "Ranks-Subgenus" );
    case "Subkingdom":
      return t( "Ranks-Subkingdom" );
    case "Suborder":
      return t( "Ranks-Suborder" );
    case "Subphylum":
      return t( "Ranks-Subphylum" );
    case "Subsection":
      return t( "Ranks-Subsection" );
    case "Subspecies":
      return t( "Ranks-Subspecies" );
    case "Subterclass":
      return t( "Ranks-Subterclass" );
    case "Subtribe":
      return t( "Ranks-Subtribe" );
    case "Superclass":
      return t( "Ranks-Superclass" );
    case "Superfamily":
      return t( "Ranks-Superfamily" );
    case "Superorder":
      return t( "Ranks-Superorder" );
    case "Supertribe":
      return t( "Ranks-Supertribe" );
    case "Tribe":
      return t( "Ranks-Tribe" );
    case "Variety":
      return t( "Ranks-Variety" );
    case "Zoosection":
      return t( "Ranks-Zoosection" );
    case "Zoosubsection":
      return t( "Ranks-Zoosubsection" );
    default:
      return t( "Unknown--rank" );
  }
}
