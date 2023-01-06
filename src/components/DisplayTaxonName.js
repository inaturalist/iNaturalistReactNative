// @flow

import { Text } from "components/styledComponents";
import _ from "lodash";
import type { Node } from "react";
import React from "react";

type Props = {
  item: Object,
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
    taxonData.commonName = _.trim( taxon.preferred_common_name );
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

  if ( user.prefers_scientific_name_first && taxonData.commonName ) {
    title = `${title} (${taxonData.commonName})`;
  } else if ( taxonData.commonName ) {
    title = `${taxonData.commonName} (${title})`;
  }
console.log(title)
  return <Text numberOfLines={1}>{title}</Text>;
};

export default DisplayTaxonName;
