// @flow

import { Text } from "components/styledComponents";
import _ from "lodash";
import type { Node } from "react";
import React from "react";

type Props = {
  item: Object,
};

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

const capitalize = s => {
  // As far as I can tell, Javascript has no word metacharacter that matches
  // Unicode characters, and even support for explicit Unicode matches like this
  // only works in modern browsers. Might be an argument for performing
  // capitalization in Ruby before addition to the db. If the lack of support in
  // older browsers becomes a problem, we might consider moving or duplicating
  // this into React and using https://babeljs.io/docs/plugins/transform-es2015
  // -unicode-regex. We could also use the command line tool there to convert
  // just these patterns for use outside of React
  // eslint-disable-next-line max-len
  const lowerCaseChars = "µßàáâãäåæçèéêëìíîïðñòóôõöøØùúûüýþÿāăąćĉċčďēĕėęěĝğġģĥĩīĭįĵķĺļľłńņňōŏőŒœŕŗřśŝşšţťũūŭůűųŵŷźżžơưǎǐǒǔǖǘǚǜǟǡǣǧǩǫǭǯǰǵǹǻǽǿȁȃȅȇȉȋȍȏȑȓȕȗșțȟȧȩȫȭȯȱȳΩḁḃḅḇḉḋḍḏḑḓḕḗḙḛḝḟḡḣḥḧḩḫḭḯḱḳḵḷḹḻḽḿṁṃṅṇṉṋṍṏṑṓṕṗṙṛṝṟṡṣṥṧṩṫṭṯṱṳṵṷṹṻṽṿẁẃẅẇẉẋẍẏẑẓẕẖẗẘẙẛạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ∂∆∑ﬁﬂ";
  // On the web, we use toUpperCase to generate this at runtime, but that
  // seems to be causing a bug in the Android JS engine as of 20230110, so
  // we're hard-coding it here. ~~~kueda 20220110
  // eslint-disable-next-line max-len
  const upperCaseChars = "ΜSSÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØØÙÚÛÜÝÞŸĀĂĄĆĈĊČĎĒĔĖĘĚĜĞĠĢĤĨĪĬĮĴĶĹĻĽŁŃŅŇŌŎŐŒŒŔŖŘŚŜŞŠŢŤŨŪŬŮŰŲŴŶŹŻŽƠƯǍǏǑǓǕǗǙǛǞǠǢǦǨǪǬǮJ̌ǴǸǺǼǾȀȂȄȆȈȊȌȎȐȒȔȖȘȚȞȦȨȪȬȮȰȲΩḀḂḄḆḈḊḌḎḐḒḔḖḘḚḜḞḠḢḤḦḨḪḬḮḰḲḴḶḸḺḼḾṀṂṄṆṈṊṌṎṐṒṔṖṘṚṜṞṠṢṤṦṨṪṬṮṰṲṴṶṸṺṼṾẀẂẄẆẈẊẌẎẐẒẔH̱T̈W̊Y̊ṠẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼẾỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴỶỸ∂∆∑FIFL";
  // I don't feel great about disabling this eslint check, but the this
  // approach does prevent the crash on Android. We should keep in mind that
  // there may be capitalization issues down the road ~~~kueda 20230110
  // eslint-disable-next-line no-misleading-character-class
  const allCasePattern = new RegExp(
    `[A-z${lowerCaseChars}${upperCaseChars}]`
  );
  const firstLetterMatch = s.match( allCasePattern );
  let firstLetterIndex = firstLetterMatch ? firstLetterMatch.index : 0;
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

const capitalizeCommonName = name => {
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

const DisplayTaxonName = ( { item: { user, taxon } }: Props ): Node => {
  if ( !taxon ) {
    const text = "unknown";
    return <Text numberOfLines={1}>{text}</Text>;
  }
  const taxonData = {};

  taxonData.rank = taxon.rank;

  // Logic follows the SplitTaxon component from web
  // https://github.com/inaturalist/inaturalist/blob/main/app/webpack/shared/components/split_taxon.jsx
  if ( taxon.preferred_common_name ) {
    taxonData.commonName = capitalizeCommonName( taxon.preferred_common_name );
  }

  let { name: scientificName } = taxon;
  if ( taxon.rank === "stateofmatter" ) {
    // @todo translation
    scientificName = "stateofmatter";
  }
  if ( taxon.rank_level < 10 ) {
    let rankPiece;
    if ( taxon.rank === "variety" ) {
      rankPiece = "var.";
    } else if ( taxon.rank === "subspecies" ) {
      rankPiece = "ssp.";
    } else if ( taxon.rank === "form" ) {
      rankPiece = "f.";
    }

    if ( rankPiece ) {
      scientificName = scientificName.split( " " );
      scientificName.splice( -1, 0, rankPiece );
      scientificName = scientificName.join( " " );
    }
  } else if ( taxon.rank_level > 10 ) {
    scientificName = scientificName.split( " " );
    scientificName.unshift( taxon.rank );
    scientificName = scientificName.join( " " );
  }

  taxonData.scientificName = _.trim( scientificName );

  let title = taxonData.scientificName;

  if ( user?.prefers_scientific_name_first && taxonData.commonName ) {
    title = `${title} (${taxonData.commonName})`;
  } else if ( taxonData.commonName ) {
    title = `${taxonData.commonName} (${title})`;
  }

  return <Text numberOfLines={1}>{title}</Text>;
};

export default DisplayTaxonName;
