// @flow

import {
  BackButton
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

import TaxonDetailsTitle from "./TaxonDetailsTitle";

type Props = {
  onClose: Function,
  showSpeciesSeenCheckmark: boolean,
  taxon: Object
}

const BACK_BUTTON_STYLE = {
  marginLeft: 10
};

const TaxonDetailsMediaViewerHeader = ( {
  onClose,
  showSpeciesSeenCheckmark,
  taxon
}: Props ): Node => (
  <View className="bg-white w-full flex-row pt-4 pb-4 pr-4 items-start">
    <BackButton
      inCustomHeader
      customStyles={BACK_BUTTON_STYLE}
      onPress={onClose}
    />
    <TaxonDetailsTitle taxon={taxon} showSpeciesSeenCheckmark={showSpeciesSeenCheckmark} />
  </View>
);

export default TaxonDetailsMediaViewerHeader;
