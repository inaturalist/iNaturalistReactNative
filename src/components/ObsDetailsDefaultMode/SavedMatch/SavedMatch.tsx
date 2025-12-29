import { useNetInfo } from "@react-native-community/netinfo";
import { matchCardClassBottom, matchCardClassTop } from "components/Match/Match";
import MatchHeader from "components/Match/MatchHeader";
import PhotosSection from "components/Match/PhotosSection";
import LocationSection from "components/ObsDetailsDefaultMode/LocationSection/LocationSection";
import MapSection from "components/ObsDetailsDefaultMode/MapSection/MapSection";
import { Button, ScrollViewWrapper } from "components/SharedComponents";
import ObsEditHeaderRight from "components/SharedComponents/ObsDetails/ObsEditHeaderRight";
import { View } from "components/styledComponents";
import _ from "lodash";
import React from "react";
import type { RealmObservation } from "realmModels/types";
import { useTranslation } from "sharedHooks";

interface Props {
  observation: RealmObservation;
  navToTaxonDetails: ( ) => void;
}

const SavedMatch = ( {
  observation,
  navToTaxonDetails,
}: Props ) => {
  const { t } = useTranslation( );
  const { isConnected } = useNetInfo( );

  const latitude = observation?.privateLatitude || observation?.latitude;
  const { taxon } = observation;

  return (
    <ScrollViewWrapper testID="SavedMatch.container">
      <ObsEditHeaderRight observation={observation} />
      <View className={`${matchCardClassTop} mt-[10px]`}>
        <MatchHeader hideObservationStatus topSuggestion={observation} />
      </View>
      <PhotosSection
        taxon={taxon}
        obsPhotos={observation.observationPhotos}
        navToTaxonDetails={navToTaxonDetails}
        hideTaxonPhotos={!isConnected}
      />
      <View className="border-[1.5px] border-white" />
      {latitude && (
        <MapSection observation={observation} taxon={taxon} />
      )}
      <LocationSection
        belongsToCurrentUser
        observation={observation}
      />
      <View className={matchCardClassBottom} />
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
