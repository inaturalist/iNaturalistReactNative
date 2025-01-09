import {
  Body2,
  Body4,
  DisplayTaxonName,
  Heading1,
  Subheading2
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  taxon: {
    preferred_common_name: string,
    name: string,
    id: number
  },
  confidence: number
}

const MatchHeader = ( { taxon, confidence }: Props ) => {
  const { t } = useTranslation( );

  const suggestedTaxon = taxon;
  const taxonId = taxon?.id || "unknown";

  const showSuggestedTaxon = ( ) => (
    <View className="shrink">
      <DisplayTaxonName
        taxon={suggestedTaxon}
        testID={`ObsDetails.taxon.${taxonId}`}
        accessibilityHint={t( "Navigates-to-taxon-details" )}
        topTextComponent={Heading1}
        bottomTextComponent={Subheading2}
      />
    </View>
  );

  return (
    <View>
      <Body2 className="mb-2">{t( "You-observed-a-new-species" )}</Body2>
      <View className="flex-row justify-between items-center">
        {showSuggestedTaxon( )}
        <View className="justify-end items-center ml-5">
          <Subheading2 className="text-inatGreen mb-2">
            {t( "X-percent", { count: confidence } )}
          </Subheading2>
          <Body4 className="text-inatGreen">
            {t( "Confidence--label" )}
          </Body4>
        </View>
      </View>
    </View>
  );
};

export default MatchHeader;
