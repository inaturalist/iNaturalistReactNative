import type { ApiTaxon } from "api/types";
import classnames from "classnames";
import ObsImagePreview from "components/ObservationsFlashList/ObsImagePreview.tsx";
import {
  Body4,
  DisplayTaxonName
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React, { useEffect, useRef } from "react";
import type { RealmTaxon } from "realmModels/types";
import { accessibleTaxonName } from "sharedHelpers/taxon";
import {
  useCurrentUser, useTranslation
} from "sharedHooks";

type Props = {
  confidence: number,
  handlePress?: ( ) => void,
  taxon: RealmTaxon | ApiTaxon,
  testID?: string,
  updateMaxHeight?: ( ) => void,
  forcedHeight: number
}

const SuggestionsResult = ( {
  confidence,
  handlePress,
  taxon,
  testID = `SuggestionsResult.${taxon?.id}`,
  updateMaxHeight,
  forcedHeight
}: Props ) => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );

  // make sure we only measure heights of items once
  const measuredRef = useRef( false );

  useEffect( ( ) => {
    if ( forcedHeight > 0 ) {
      measuredRef.current = true;
    } else {
      measuredRef.current = false;
    }
  }, [forcedHeight] );

  const accessibleName = accessibleTaxonName( taxon, currentUser, t );

  // A representative photo is dependant on the actual image that was scored by computer vision
  // and is currently not added to the taxon realm. So, if it is available directly from the
  // suggestion, i.e. taxonProp, use it. Otherwise, use the default photo from the taxon.
  const taxonImage = {
    uri: taxon?.representative_photo?.url
      || taxon?.default_photo?.url
      || taxon?.defaultPhoto?.url
  };

  // Handle the onLayout event to measure item height
  const handleLayout = event => {
    const { height } = event.nativeEvent.layout;
    // Only report height once to avoid infinite loops
    if ( updateMaxHeight && height > 0 && !measuredRef.current ) {
      measuredRef.current = true;
      updateMaxHeight( height );
    }
  };

  const cardContent = classnames(
    "px-[10px] py-[19px]",
    "flex-row justify-center items-center",
    "border-lightGray border-[2px] rounded-2xl",
    "w-[241px]",
    "mr-3.5"
  );

  // note: it doesn't seem like we need to add styling here as long as we're
  // using isReady and rerendering the whole list, but be suspicious of tailwind
  // if the bottom padding is getting cut off in this list
  const styleWithForcedHeight = forcedHeight
    ? {
      height: forcedHeight
    }
    : undefined;

  return (
    <View onLayout={handleLayout}>
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
        style={forcedHeight
          ? styleWithForcedHeight
          : undefined}
      >
        <View className="w-[62px] h-[62px] mr-3">
          <ObsImagePreview
          // TODO fix when ObsImagePreview typed
            source={taxonImage}
            testID={`${testID}.photo`}
            iconicTaxonName={taxon?.iconic_taxon_name}
            className="rounded-xl"
            isSmall
            isBackground={false}
          />
        </View>
        <View className="w-[149px]">
          <DisplayTaxonName
            taxon={taxon}
            color="text-darkGray"
            scientificNameFirst={currentUser?.prefers_scientific_name_first}
            prefersCommonNames={currentUser?.prefers_common_names}
            underlineTopText
            ellipsizeCommonName
            numberOfLinesBottomText={1}
          />
          <Body4 className="text-inatGreen mt-1.5">
            {t( "X-percent-confidence", {
              count: confidence
            } )}
          </Body4>
        </View>
      </Pressable>
    </View>
  );
};

export default SuggestionsResult;
