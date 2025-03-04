import { useNetInfo } from "@react-native-community/netinfo";
import LocationSection
  from "components/ObsDetailsDefaultMode/LocationSection/LocationSection.tsx";
import MapSection
  from "components/ObsDetailsDefaultMode/MapSection/MapSection";
import {
  ActivityIndicator, Button, ScrollViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import _ from "lodash";
import React from "react";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import AdditionalSuggestionsScroll
  from "./AdditionalSuggestions/AdditionalSuggestionsScroll";
import EmptyMapSection from "./EmptyMapSection";
import MatchHeader from "./MatchHeader";
import PhotosSection from "./PhotosSection";
import SaveDiscardButtons from "./SaveDiscardButtons";

const cardClassTop = "rounded-t-2xl border-lightGray border-[2px] p-4 border-b-0 -mb-0.5";
const cardClassBottom = "rounded-b-2xl border-lightGray border-[2px] pb-3 border-t-0 -mt-0.5 mb-4";

type Props = {
  observation: Object,
  obsPhotos: Array<Object>,
  handleSaveOrDiscardPress: ( ) => void,
  navToTaxonDetails: ( ) => void,
  handleLocationPickerPressed: ( ) => void,
  onSuggestionChosen: ( ) => void,
  scrollRef: Object
}

const Match = ( {
  observation,
  obsPhotos,
  handleSaveOrDiscardPress,
  navToTaxonDetails,
  handleLocationPickerPressed,
  onSuggestionChosen,
  scrollRef
}: Props ) => {
  const { t } = useTranslation( );
  const { isConnected } = useNetInfo( );
  const isLoading = useStore( state => state.isLoading );
  const suggestionsList = useStore( state => state.suggestionsList );

  const latitude = observation?.privateLatitude || observation?.latitude;
  const taxon = suggestionsList?.[0]?.taxon;

  return (
    <>
      <ScrollViewWrapper scrollRef={scrollRef}>
        <View className={cardClassTop}>
          {
            isLoading
              ? (
                <ActivityIndicator size={33} />
              )
              : <MatchHeader topSuggestion={suggestionsList?.[0]} />
          }
        </View>
        <PhotosSection
          representativePhoto={taxon?.representative_photo}
          taxon={taxon}
          obsPhotos={obsPhotos}
          navToTaxonDetails={navToTaxonDetails}
        />
        <View className="border-[1.5px] border-white" />
        {!latitude
          ? <EmptyMapSection handleLocationPickerPressed={handleLocationPickerPressed} />
          : (
            <MapSection observation={observation} taxon={taxon} />
          )}
        <LocationSection
          belongsToCurrentUser
          observation={observation}
          handleLocationPickerPressed={!latitude
            ? handleLocationPickerPressed
            : null}
        />
        <View className={cardClassBottom} />
        <View className="pt-2">
          {
            isConnected && (
              <Button
                className="mx-5 mb-2"
                level="primary"
                text={taxon?.rank_level === 10
                  ? t( "LEARN-MORE-ABOUT-THIS-SPECIES" )
                  : t( "LEARN-MORE-ABOUT-THIS-GROUP" )}
                onPress={navToTaxonDetails}
                accessibilityHint={t( "Navigates-to-taxon-details" )}
              />
            )
          }
          <AdditionalSuggestionsScroll
            onSuggestionChosen={onSuggestionChosen}
            otherSuggestions={_.tail( suggestionsList )}
            isLoading={isLoading}
          />
          {!latitude && (
            <Button
              className="mx-5 mb-7"
              level="neutral"
              text={t( "ADD-LOCATION-FOR-BETTER-IDS" )}
              onPress={handleLocationPickerPressed}
              accessibilityLabel={t( "Edit-location" )}
              accessibilityHint={t( "Add-location-to-refresh-suggestions" )}
            />
          )}
        </View>
      </ScrollViewWrapper>
      <SaveDiscardButtons
        handlePress={handleSaveOrDiscardPress}
      />
    </>
  );
};

export default Match;
