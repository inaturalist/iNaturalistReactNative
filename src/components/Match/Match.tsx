import { useNetInfo } from "@react-native-community/netinfo";
import type { ApiPhoto, ApiSuggestion } from "api/types";
import LocationSection
  from "components/ObsDetailsDefaultMode/LocationSection/LocationSection";
import MapSection
  from "components/ObsDetailsDefaultMode/MapSection/MapSection";
import {
  Body2, Button, Heading3, ScrollViewWrapper,
} from "components/SharedComponents";
import HeaderEditIcon from "components/SharedComponents/ObsDetails/HeaderEditIcon";
import { View } from "components/styledComponents";
import _ from "lodash";
import React from "react";
import type { ScrollView } from "react-native";
import type {
  RealmObservation, RealmObservationPhoto, RealmPhoto, RealmTaxon,
} from "realmModels/types";
import { useTranslation } from "sharedHooks";

import AdditionalSuggestionsScroll
  from "./AdditionalSuggestions/AdditionalSuggestionsScroll";
import EmptyMapSection from "./EmptyMapSection";
import IconicSuggestionsScroll from "./IconicSuggestions/IconicSuggestionsScroll";
import type { MatchButtonAction } from "./MatchContainer";
import MatchScreenTopContent from "./MatchScreenTopContent";
import PhotosSection from "./PhotosSection";
import SaveDiscardButtons from "./SaveDiscardButtons";

export const matchCardClassTop
  = "rounded-t-2xl border-lightGray border-[2px] py-[18px] px-5 border-b-0 -mb-0.5";
export const matchCardClassBottom
  = "rounded-b-2xl border-lightGray border-[2px] pb-3 border-t-0 -mt-0.5 mb-[30px]";

interface Props {
  observation: RealmObservation;
  obsPhotos: RealmObservationPhoto[];
  handleSaveOrDiscardPress: ( action: MatchButtonAction ) => void;
  navToTaxonDetails: ( photo?: ApiPhoto | RealmPhoto ) => void;
  isFetchingLocation: boolean;
  handleAddLocationPressed: ( ) => void;
  topSuggestion?: ApiSuggestion;
  otherSuggestions: ApiSuggestion[];
  suggestionsLoading: boolean;
  onSuggestionChosen: ( suggestion: ApiSuggestion ) => void;
  scrollRef: React.RefObject<ScrollView | null>;
  iconicTaxon?: RealmTaxon;
  setIconicTaxon: ( taxon: RealmTaxon ) => void;
}

const Match = ( {
  observation,
  obsPhotos,
  handleSaveOrDiscardPress,
  navToTaxonDetails,
  isFetchingLocation,
  handleAddLocationPressed,
  topSuggestion,
  otherSuggestions,
  suggestionsLoading,
  onSuggestionChosen,
  scrollRef,
  iconicTaxon,
  setIconicTaxon,
}: Props ) => {
  const { t } = useTranslation( );
  const { isConnected } = useNetInfo( );

  const latitude = observation?.privateLatitude || observation?.latitude;
  const taxon = topSuggestion?.taxon;
  const hasNoSuggestions = !topSuggestion && otherSuggestions.length === 0;
  const hasOnlyOtherSuggestions = !topSuggestion && otherSuggestions.length > 0;

  return (
    <>
      <ScrollViewWrapper scrollRef={scrollRef}>
        <View className={matchCardClassTop}>
          <MatchScreenTopContent
            suggestionsLoading={suggestionsLoading}
            topSuggestion={topSuggestion}
            hasNoSuggestions={hasNoSuggestions}
            hasOnlyOtherSuggestions={hasOnlyOtherSuggestions}
          />
          <HeaderEditIcon observation={observation} lastScreen="Match" />
        </View>
        <PhotosSection
          representativePhoto={topSuggestion?.taxon?.representative_photo}
          taxon={taxon}
          obsPhotos={obsPhotos}
          navToTaxonDetails={navToTaxonDetails}
        />
        {topSuggestion && (
          <>
            <View className="border-[1.5px] border-white" />
            {!latitude
              ? (
                <EmptyMapSection
                  handleAddLocationPressed={handleAddLocationPressed}
                  isFetchingLocation={isFetchingLocation}
                />
              )
              : (
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
            <View className="mb-[30px]">
              <AdditionalSuggestionsScroll
                onSuggestionChosen={onSuggestionChosen}
                otherSuggestions={otherSuggestions}
                suggestionsLoading={suggestionsLoading}
              />
            </View>
          </>
        )}
        {hasOnlyOtherSuggestions && (
          <View className="mt-5 mb-[30px]">
            <AdditionalSuggestionsScroll
              noTopSuggestion
              onSuggestionChosen={onSuggestionChosen}
              otherSuggestions={otherSuggestions}
              suggestionsLoading={suggestionsLoading}
            />
          </View>
        )}
        {hasNoSuggestions && !suggestionsLoading && (
          <View className="mt-5">
            <Heading3 className="mx-5">
              {t( "Do-you-know-what-group-this-is-in" )}
            </Heading3>
            <IconicSuggestionsScroll
              iconicTaxonChosen={iconicTaxon}
              onIconicTaxonChosen={setIconicTaxon}
            />
            <Body2 className="mx-5 my-[30px]">
              {t( "If-you-save-this-observation-and-upload-it-to-iNaturalist" )}
            </Body2>
            <Body2 className="mx-3 my-[30px]">
              {t( "Or-you-can-try-to-get-a-clearer-photo-by-zooming-in-getting-closer" )}
            </Body2>
          </View>
        )}
        {!latitude && (
          <Button
            className="mx-4 mb-[30px]"
            level="neutral"
            text={t( "ADD-LOCATION-FOR-BETTER-IDS" )}
            onPress={handleAddLocationPressed}
            loading={isFetchingLocation}
            disabled={isFetchingLocation}
            accessibilityLabel={t( "Edit-location" )}
            accessibilityHint={t( "Add-location-to-refresh-suggestions" )}
          />
        )}
      </ScrollViewWrapper>
      <SaveDiscardButtons
        handlePress={handleSaveOrDiscardPress}
      />
    </>
  );
};

export default Match;
