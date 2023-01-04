// @flow

import { Text } from "components/styledComponents";
import _ from "lodash";
import React from "react";
import type { Node } from "react";

type Props = {
  item: Object,
};

const DisplayTaxonName = ({ item: { user, taxon } }: Props): Node => {
  if (!taxon) {
    const text = "unknown";
    return <Text numberOfLines={1}>{text}</Text>;
  }
  const taxonData = {};

  taxonData.rank = taxon.rank;

  if (taxon.preferred_common_name) {
    taxonData.commonName = _.trim(taxon.preferred_common_name);
  }

  let { name: sciName } = taxon;
  if (taxon.rank === "stateofmatter") {
    // @todo translation
    sciName = "stateofmatter";
  }
  if (taxon.rank_level < 10) {
    let rankPiece;
    if (taxon.rank === "variety") {
      rankPiece = "var.";
    } else if (taxon.rank === "subspecies") {
      rankPiece = "ssp.";
    } else if (taxon.rank === "form") {
      rankPiece = "f.";
    }

    if (rankPiece) {
      sciName = sciName.split(" ").splice(-1, 0, rankPiece).join(" ");
    }
  } else if (taxon.rank_level > 10) {
    sciName = sciName.split(" ");
    sciName.unshift(taxon.rank);
    sciName = sciName.join(" ");
  }

  taxonData.sciName = _.trim(sciName);

  let title = taxonData.sciName;

  if (user.prefers_scientific_name_first && taxonData.commonName) {
    title = `${title} (${taxonData.commonName})`;
  } else if (taxonData.commonName) {
    title = `${taxonData.commonName} (${title})`;
  }

  return <Text numberOfLines={1}>{title || "no name"}</Text>;
};

export default DisplayTaxonName;
