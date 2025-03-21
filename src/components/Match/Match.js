import { useNetInfo } from "@react-native-community/netinfo";
import LocationSection
  from "components/ObsDetailsDefaultMode/LocationSection/LocationSection.tsx";
import MapSection
  from "components/ObsDetailsDefaultMode/MapSection/MapSection";
import {
  ActivityIndicator, Body2, Button, Heading3, ScrollViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import _ from "lodash";
import React from "react";
import { useTranslation } from "sharedHooks";

import AdditionalSuggestionsScroll
  from "./AdditionalSuggestions/AdditionalSuggestionsScroll";
import EmptyMapSection from "./EmptyMapSection";
import IconicSuggestionsScroll from "./IconicSuggestions/IconicSuggestionsScroll";
import MatchHeader from "./MatchHeader";
import PhotosSection from "./PhotosSection";
import SaveDiscardButtons from "./SaveDiscardButtons";

const cardClassTop
  = "rounded-t-2xl border-lightGray border-[2px] py-[18px] px-5 border-b-0 -mb-0.5";
const cardClassBottom = "rounded-b-2xl border-lightGray border-[2px] pb-3 border-t-0 -mt-0.5 mb-4";

type Props = {
  observation: Object,
  obsPhotos: Array<Object>,
  handleSaveOrDiscardPress: ( ) => void,
  navToTaxonDetails: ( ) => void,
  handleAddLocationPressed: ( ) => void,
  topSuggestion: Object,
  otherSuggestions: Array<Object>,
  suggestionsLoading: boolean,
  onSuggestionChosen: ( ) => void,
  scrollRef: Object,
  iconicTaxon: Object,
  setIconicTaxon: ( ) => void
}

const Match = ( {
  observation,
  obsPhotos,
  handleSaveOrDiscardPress,
  navToTaxonDetails,
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
          <View className={cardClassTop}>
            {
              suggestionsLoading
                ? (
                  <ActivityIndicator size={33} />
                )
                : (
                  <Body2>
                    {t( "iNaturalist-couldnt-identify-this-organism" )}
                  </Body2>
                )
            }
          </View>
          <PhotosSection
            representativePhoto={topSuggestion?.taxon?.representative_photo}
            taxon={taxon}
            obsPhotos={obsPhotos}
            navToTaxonDetails={navToTaxonDetails}
          />
          { !suggestionsLoading
          && (
            <View className="mt-5">
              <Heading3 className="mx-4">
                {t( "Do-you-know-what-group-this-is-in" )}
              </Heading3>
              <IconicSuggestionsScroll
                iconicTaxonChosen={iconicTaxon}
                onIconicTaxonChosen={setIconicTaxon}
              />
              <Body2 className="mx-4 mt-7 mb-20">
                {t( "If-you-took-the-original-photo-you-can-help" )}
              </Body2>
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
          <View className={cardClassTop}>
            {
              suggestionsLoading
                ? (
                  <ActivityIndicator size={33} />
                )
                : (
                  <Body2>
                    {t( "Were-not-confident-enough-to-make-an-ID" )}
                  </Body2>
                )
            }
          </View>
          <PhotosSection
            representativePhoto={topSuggestion?.taxon?.representative_photo}
            taxon={taxon}
            obsPhotos={obsPhotos}
            navToTaxonDetails={navToTaxonDetails}
          />
          <View className="pt-2">
            <AdditionalSuggestionsScroll
              noTopSuggestion
              onSuggestionChosen={onSuggestionChosen}
              otherSuggestions={otherSuggestions}
              suggestionsLoading={suggestionsLoading}
            />
            {!latitude && (
              <Button
                className="mx-5 mb-7"
                level="neutral"
                text={t( "ADD-LOCATION-FOR-BETTER-IDS" )}
                onPress={handleAddLocationPressed}
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
  }

  return (
    <>
      <ScrollViewWrapper scrollRef={scrollRef}>
        <View className={cardClassTop}>
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
          ? <EmptyMapSection handleAddLocationPressed={handleAddLocationPressed} />
          : (
            <MapSection observation={observation} taxon={taxon} />
          )}
        <LocationSection
          belongsToCurrentUser
          observation={observation}
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
            otherSuggestions={otherSuggestions}
            suggestionsLoading={suggestionsLoading}
          />
          {!latitude && (
            <Button
              className="mx-5 mb-7"
              level="neutral"
              text={t( "ADD-LOCATION-FOR-BETTER-IDS" )}
              onPress={handleAddLocationPressed}
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
