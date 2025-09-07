import type { ApiTaxon } from "api/types";
import classnames from "classnames";
import ObsImagePreview from "components/ObservationsFlashList/ObsImagePreview";
import {
  Body4,
  DisplayTaxonName
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React, { useEffect, useRef } from "react";
import type { LayoutChangeEvent } from "react-native";
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
  updateMaxHeight?: ( height: number ) => void,
  forcedHeight: number
}

const SuggestionsResult = ( {
  confidence,
  handlePress,
  taxon,
  testID,
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

  if ( !taxon ) {
    console.warn( "Taxon is null" );
    return null;
  } if ( ( "isValid" in taxon ) && ( typeof taxon?.isValid === "function" ) && !taxon.isValid() ) {
    console.warn( "Taxon Realm object is invalidated" );
    return null;
  }

  const safeTestID = testID || `SuggestionsResult.${"id" in taxon
    ? taxon.id
    : "unknown"}`;

  const accessibleName = accessibleTaxonName( taxon, currentUser, t );

  // A representative photo is dependant on the actual image that was scored by computer vision
  // and is currently not added to the taxon realm. So, if it is available directly from the
  // suggestion, i.e. taxonProp, use it. Otherwise, use the default photo from the taxon.
  const uri = ( taxon as ApiTaxon )?.representative_photo?.url
      || ( taxon as ApiTaxon )?.default_photo?.url
      || ( taxon as RealmTaxon )?.defaultPhoto?.url;
  const taxonImage = uri
    ? { uri }
    : undefined;

  // Handle the onLayout event to measure item height
  const handleLayout = ( event: LayoutChangeEvent ) => {
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
        testID={safeTestID}
        key={safeTestID}
        style={forcedHeight
          ? styleWithForcedHeight
          : undefined}
      >
        <ObsImagePreview
          source={taxonImage}
          testID={`${safeTestID}.photo`}
          iconicTaxonName={taxon?.iconic_taxon_name}
          className="rounded-xl mr-3"
          isSmall
          isBackground={false}
        />
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
