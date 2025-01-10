import LocationSection
  from "components/ObsDetailsDefaultMode/LocationSection/LocationSection.tsx";
import MapSection
  from "components/ObsDetailsDefaultMode/MapSection/MapSection";
import { Button, Divider, ScrollViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

import AdditionalSuggestionsScroll from "./AdditionalSuggestions/AdditionalSuggestionsScroll";
import EmptyMapSection from "./EmptyMapSection";
import MatchHeader from "./MatchHeader";
import PhotosSection from "./PhotosSection";
import SaveDiscardButtons from "./SaveDiscardButtons";

// example data
const secondTaxon = {
  name: "Aves",
  preferred_common_name: "Birds",
  id: 3
};

type Props = {
  observation: Object,
  handleSaveOrDiscardPress: ( ) => void,
  navToTaxonDetails: ( ) => void,
  taxon: Object,
  confidence: number,
  handleLocationPickerPressed: ( ) => void
}

const Match = ( {
  observation,
  handleSaveOrDiscardPress,
  navToTaxonDetails,
  taxon,
  confidence,
  handleLocationPickerPressed
}: Props ) => {
  const { t } = useTranslation( );

  const latitude = observation?.privateLatitude || observation?.latitude;
  const observationPhoto = observation?.observationPhotos?.[0]?.photo?.url
    || observation?.observationPhotos?.[0]?.photo?.localFilePath;

  return (
    <>
      <ScrollViewWrapper>
        <Divider />
        <View className="p-5">
          <MatchHeader
            taxon={taxon}
            confidence={confidence}
          />
        </View>
        <PhotosSection
          taxon={taxon}
          observationPhoto={observationPhoto}
          navToTaxonDetails={navToTaxonDetails}
        />
        {!latitude
          ? <EmptyMapSection handleLocationPickerPressed={handleLocationPickerPressed} />
          : (
            <MapSection observation={observation} />
          )}
        <LocationSection
          belongsToCurrentUser
          observation={observation}
          handleLocationPickerPressed={!latitude
            ? handleLocationPickerPressed
            : null}
        />
        <View className="px-5 pt-2">
          <Button
            className="mb-2"
            level="primary"
            text={taxon?.rank_level === 10
              ? t( "LEARN-MORE-ABOUT-THIS-SPECIES" )
              : t( "LEARN-MORE-ABOUT-THIS-GROUP" )}
            onPress={navToTaxonDetails}
            accessibilityHint={t( "Navigates-to-taxon-details" )}
          />
          <AdditionalSuggestionsScroll
            suggestions={[{
              score: 0.99,
              taxon
            }, {
              score: 0.86,
              taxon: secondTaxon
            }]}
          />
          {!latitude && (
            <Button
              className="mb-7"
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
