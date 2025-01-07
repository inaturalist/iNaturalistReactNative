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

// const taxon = {
//   name: "Taxon name",
//   preferred_common_name: "Common name",
//   id: 1,
//   taxonPhotos: [{
//     photo: {
//       id: 1,
//       url: "https://static.inaturalist.org/photos/33215492/large.jpeg"
//     }
//   }, {
//     photo: {
//       id: 2,
//       url: "https://inaturalist-open-data.s3.amazonaws.com/photos/150607778/large.jpg"
//     }
//   },
//   {
//     photo: {
//       id: 3,
//       url: "https://inaturalist-open-data.s3.amazonaws.com/photos/5749655/large.jpeg"
//     }
//   }]
// };

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
  confidence: number
}

const Match = ( {
  observation,
  handleSaveOrDiscardPress,
  navToTaxonDetails,
  taxon,
  confidence
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
        <PhotosSection taxon={taxon} observationPhoto={observationPhoto} />
        {!latitude
          ? <EmptyMapSection />
          : (
            <MapSection observation={observation} />
          )}
        <LocationSection
          belongsToCurrentUser
          observation={observation}
        />
        <View className="px-5 pt-2">
          <Button
            className="mb-2"
            level="primary"
            text={t( "LEARN-MORE-ABOUT-THIS-SPECIES" )}
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
          <Button
            className="mb-7"
            level="neutral"
            text={t( "ADD-LOCATION-FOR-BETTER-IDS" )}
            onPress={navToTaxonDetails}
            accessibilityHint={t( "Add-location-to-refresh-suggestions" )}
          />
        </View>
      </ScrollViewWrapper>
      <SaveDiscardButtons
        handlePress={handleSaveOrDiscardPress}
      />
    </>
  );
};

export default Match;
