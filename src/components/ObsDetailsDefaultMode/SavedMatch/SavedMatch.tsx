import { useNetInfo } from "@react-native-community/netinfo";
import MatchHeader from "components/Match/MatchHeader";
import PhotosSection from "components/Match/PhotosSection";
import LocationSection from "components/ObsDetailsDefaultMode/LocationSection/LocationSection";
import MapSection from "components/ObsDetailsDefaultMode/MapSection/MapSection";
import { Button, ScrollViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import _ from "lodash";
import React from "react";
import type { RealmObservation } from "realmModels/types";
import { useTranslation } from "sharedHooks";

import SavedMatchHeaderRight from "./SavedMatchHeaderRight";

const cardClassTop
  = "rounded-t-2xl border-lightGray border-[2px] py-[18px] px-5 border-b-0 -mb-0.5";
const cardClassBottom
  = "rounded-b-2xl border-lightGray border-[2px] pb-3 border-t-0 -mt-0.5 mb-[30px]";

type Props = {
  observation: RealmObservation,
  navToTaxonDetails: ( ) => void,
}

const SavedMatch = ( {
  observation,
  navToTaxonDetails
}: Props ) => {
  const { t } = useTranslation( );
  const { isConnected } = useNetInfo( );

  const latitude = observation?.privateLatitude || observation?.latitude;
  const { taxon } = observation;

  /*
    todo: globalize class strings and maybe some of the resused container functions
  */

  return (
    <ScrollViewWrapper>
      <SavedMatchHeaderRight uuid={observation.uuid} />
      <View className={cardClassTop}>
        <MatchHeader hideObservationStatus topSuggestion={observation} />
      </View>
      <PhotosSection
        representativePhoto={taxon?.representative_photo}
        taxon={taxon}
        obsPhotos={observation.observationPhotos}
        navToTaxonDetails={navToTaxonDetails}
      />
      <View className="border-[1.5px] border-white" />
      {latitude && (
        <MapSection observation={observation} taxon={taxon} />
      )}
      <LocationSection
        belongsToCurrentUser
        observation={observation}
      />
      <View className={cardClassBottom} />
      {
        isConnected && (
          <Button
            className="mx-4 mb-[30px]"
            level="primary"
            text={taxon?.rank_level === 10
              ? t( "LEARN-MORE-ABOUT-THIS-SPECIES" )
              : t( "LEARN-MORE-ABOUT-THIS-GROUP" )}
            onPress={navToTaxonDetails}
            accessibilityHint={t( "Navigates-to-taxon-details" )}
          />
        )
      }
    </ScrollViewWrapper>
  );
};

export default SavedMatch;
