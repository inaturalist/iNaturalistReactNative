import type { ApiTaxon } from "api/types";
import classnames from "classnames";
import ObsImagePreview from "components/ObservationsFlashList/ObsImagePreview.tsx";
import {
  DisplayTaxonName
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import type { RealmTaxon } from "realmModels/types";
import { accessibleTaxonName } from "sharedHelpers/taxon";
import {
  useCurrentUser, useTaxon, useTranslation
} from "sharedHooks";

type Props = {
  fetchRemote?: boolean,
  fromLocal?: boolean,
  handlePress?: ( ) => void,
  taxon: RealmTaxon | ApiTaxon,
  testID?: string,
  selected?: boolean
}

const IconicSuggestion = ( {
  fetchRemote = true,
  fromLocal = true,
  handlePress,
  taxon: taxonProp,
  testID = `IconicSuggestion.${taxonProp?.id}`,
  selected
}: Props ) => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );

  // thinking about future performance, it might make more sense to batch
  // network requests for useTaxon instead of making individual API calls.
  // right now, this fetches a single taxon at a time on AI camera &
  // a short list of taxa from offline Suggestions
  const { taxon: localTaxon } = useTaxon( taxonProp, fetchRemote );
  const usableTaxon = fromLocal
    ? localTaxon
    : taxonProp;
  const accessibleName = accessibleTaxonName( usableTaxon, currentUser, t );

  // useTaxon could return null, and it's at least remotely possible taxonProp is null
  if ( !usableTaxon ) return null;

  // A representative photo is dependant on the actual image that was scored by computer vision
  // and is currently not added to the taxon realm. So, if it is available directly from the
  // suggestion, i.e. taxonProp, use it. Otherwise, use the default photo from the taxon.
  const taxonImage = {
    uri: taxonProp?.representative_photo?.url
      || usableTaxon?.default_photo?.url
      || usableTaxon?.defaultPhoto?.url
  };

  const cardContent = classnames(
    "px-[10px] py-[19px]",
    "flex-row justify-center items-center",
    "border-[2px] rounded-2xl",
    !selected
      ? "border-lightGray"
      : "border-inatGreen",
    "mr-3.5"
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibleName}
      className={cardContent}
      onPress={( ) => {
        if ( handlePress !== undefined ) {
          handlePress( );
        }
      }}
      testID={testID}
      key={testID}
    >
      <View className="w-[62px] h-[62px] mr-3">
        <ObsImagePreview
          // TODO fix when ObsImagePreview typed
          source={taxonImage}
          testID={`${testID}.photo`}
          iconicTaxonName={usableTaxon?.name}
          className="rounded-xl"
          isSmall
          isBackground={false}
        />
      </View>
      <DisplayTaxonName
        taxon={usableTaxon}
        color="text-darkGray"
        scientificNameFirst={currentUser?.prefers_scientific_name_first}
        prefersCommonNames={currentUser?.prefers_common_names}
        underlineTopText
        ellipsizeCommonName
        numberOfLinesBottomText={1}
      />
    </Pressable>
  );
};

export default IconicSuggestion;
