import { useNetInfo } from "@react-native-community/netinfo";
import type { ApiPhoto, ApiSuggestion } from "api/types";
import LocationSection
  from "components/ObsDetailsDefaultMode/LocationSection/LocationSection";
import MapSection
  from "components/ObsDetailsDefaultMode/MapSection/MapSection";
import {
  ActivityIndicator, Body2, Button, Heading3, ScrollViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import _ from "lodash";
import React from "react";
import type { ScrollView } from "react-native";
import type { RealmObservation, RealmObservationPhoto, RealmTaxon } from "realmModels/types";
import { useTranslation } from "sharedHooks";

import AdditionalSuggestionsScroll
  from "./AdditionalSuggestions/AdditionalSuggestionsScroll";
import EmptyMapSection from "./EmptyMapSection";
import IconicSuggestionsScroll from "./IconicSuggestions/IconicSuggestionsScroll";
import MatchHeader from "./MatchHeader";
import PhotosSection from "./PhotosSection";
import SaveDiscardButtons from "./SaveDiscardButtons";

export const matchCardClassTop
  = "rounded-t-2xl border-lightGray border-[2px] py-[18px] px-5 border-b-0 -mb-0.5";
export const matchCardClassBottom
  = "rounded-b-2xl border-lightGray border-[2px] pb-3 border-t-0 -mt-0.5 mb-[30px]";

type Props = {
  observation: RealmObservation,
  obsPhotos: RealmObservationPhoto[],
  handleSaveOrDiscardPress: ( action: string ) => void,
  navToTaxonDetails: ( photo?: ApiPhoto ) => void,
  isFetchingLocation: boolean,
  handleAddLocationPressed: ( ) => void,
  topSuggestion?: ApiSuggestion,
  otherSuggestions: ApiSuggestion[],
  suggestionsLoading: boolean,
  onSuggestionChosen: ( suggestion: ApiSuggestion ) => void,
  scrollRef: React.RefObject<ScrollView | null>,
  iconicTaxon?: RealmTaxon,
  setIconicTaxon: ( taxon: RealmTaxon ) => void
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
  setIconicTaxon
}: Props ) => {
  const { t } = useTranslation( );
  const { isConnected } = useNetInfo( );

  const latitude = observation?.privateLatitude || observation?.latitude;
  const taxon = topSuggestion?.taxon;

  // In case there are no suggestions, at all
  if ( !topSuggestion && otherSuggestions.length === 0 ) {
    return (
      <>
        <ScrollViewWrapper scrollRef={scrollRef}>
          <View className={matchCardClassTop}>
            {
              suggestionsLoading
                ? (
                  <ActivityIndicator size={33} />
                )
                : (
                  <Body2>
                    {t( "The-AI-is-not-confident-Upload-to-ask-the-community" )}
                  </Body2>
                )
            }
          </View>
          <PhotosSection
            taxon={taxon}
            obsPhotos={obsPhotos}
            navToTaxonDetails={navToTaxonDetails}
          />
          { !suggestionsLoading
          && (
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
              {!latitude && (
                <Button
                  className="mx-4 mb-[30px]"
                  level="neutral"
                  text={t( "ADD-LOCATION-FOR-BETTER-IDS" )}
                  loading={isFetchingLocation}
                  disabled={isFetchingLocation}
                  onPress={handleAddLocationPressed}
                  accessibilityLabel={t( "Edit-location" )}
                  accessibilityHint={t( "Add-location-to-refresh-suggestions" )}
                />
              )}
            </View>
          )}
        </ScrollViewWrapper>
        <SaveDiscardButtons
          handlePress={handleSaveOrDiscardPress}
        />
      </>
    );
  }
  // In case there are suggestions but no top suggestion
  if ( !topSuggestion ) {
    return (
      <>
        <ScrollViewWrapper scrollRef={scrollRef}>
          <View className={matchCardClassTop}>
            {
              suggestionsLoading
                ? (
                  <ActivityIndicator size={33} />
                )
                : (
                  <Body2>
                    {t( "The-AI-is-not-confident-It-may-be-one-of-the-IDs-below" )}
                  </Body2>
                )
            }
          </View>
          <PhotosSection
            taxon={taxon}
            obsPhotos={obsPhotos}
            navToTaxonDetails={navToTaxonDetails}
          />
          <View className="mt-5 mb-[30px]">
            <AdditionalSuggestionsScroll
              noTopSuggestion
              onSuggestionChosen={onSuggestionChosen}
              otherSuggestions={otherSuggestions}
              suggestionsLoading={suggestionsLoading}
            />
          </View>
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
  }

  return (
    <>
      <ScrollViewWrapper scrollRef={scrollRef}>
        <View className={matchCardClassTop}>
          {
            suggestionsLoading
              ? (
                <ActivityIndicator size={33} />
              )
              : <MatchHeader topSuggestion={topSuggestion} />
          }
        </View>
        <PhotosSection
          representativePhoto={topSuggestion?.taxon?.representative_photo}
          taxon={taxon}
          obsPhotos={obsPhotos}
          navToTaxonDetails={navToTaxonDetails}
        />
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
