import { useNavigation } from "@react-navigation/native";
import SortBySheet from "components/Explore/Sheets/SortBySheet";
import {
  Body3,
  Button,
  DisplayTaxon,
  Heading1,
  Heading4,
  IconicTaxonChooser,
  INatIcon
} from "components/SharedComponents";
import { Pressable, ScrollView, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { useTranslation } from "sharedHooks";

const NumberBadge = ( { number } ): Node => (
  <View className="ml-3 w-5 h-5 justify-center items-center rounded-full bg-inatGreen">
    <Body3 className="text-white">{number}</Body3>
  </View>
);

type Props = {
  closeModal: Function,
  exploreFilters: Object,
  filtersNotDefault: boolean,
  resetFilters: Function,
  updateTaxon: Function,
  updateSortBy: Function
};

const FilterModal = ( {
  closeModal,
  exploreFilters,
  filtersNotDefault,
  resetFilters,
  updateTaxon,
  updateSortBy
}: Props ): Node => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { taxon, region, sortBy } = exploreFilters;

  const [showSortBy, setShowSortBy] = useState( false );

  // TODO: actually calculate this number
  const number = 0;

  const sortByButtonText = () => {
    switch ( sortBy ) {
      case "DATE_UPLOADED_OLDEST":
        return t( "DATE-UPLOADED-OLDEST" );
      case "DATE_OBSERVED_NEWEST":
        return t( "DATE-OBSERVED-NEWEST" );
      case "DATE_OBSERVED_OLDEST":
        return t( "DATE-OBSERVED-OLDEST" );
      case "MOST_FAVED":
        return t( "MOST-FAVED" );
      case "DATE_UPLOADED_NEWEST":
      default:
        return t( "DATE-UPLOADED-NEWEST" );
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      {/* TODO: add dropshadow */}
      <View className="flex-row items-center p-5 justify-between">
        <View className="flex-row items-center">
          <INatIcon name="sliders" size={20} />
          <Heading1 className="ml-3">{t( "Explore-Filters" )}</Heading1>
          {/* TODO: add shadow */}
          {number !== 0 && <NumberBadge number={number} />}
        </View>
        {filtersNotDefault
          ? (
            <Body3 onPress={resetFilters}>{t( "Reset" )}</Body3>
          )
          : (
            <Body3 className="opacity-50">{t( "Reset" )}</Body3>
          )}
      </View>

      <ScrollView className="p-5">
        {/* Taxon Section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "TAXON" )}</Heading4>
          <View className="mb-5">
            {taxon
              ? (
                <DisplayTaxon
                  taxon={taxon}
                  handlePress={() => {
                    closeModal();
                    navigation.navigate( "ExploreTaxonSearch" );
                  }}
                >
                  <INatIcon name="edit" size={22} />
                </DisplayTaxon>
              )
              : (
                <Button
                  text={t( "SEARCH-FOR-A-TAXON" )}
                  onPress={() => {
                    closeModal();
                    navigation.navigate( "ExploreTaxonSearch" );
                  }}
                  accessibilityLabel={t( "Search" )}
                />
              )}
          </View>
          <IconicTaxonChooser taxon={taxon} onTaxonChosen={updateTaxon} />
        </View>

        {/* Location Section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "LOCATION" )}</Heading4>
          <View className="mb-5">
            {region.place_guess
              ? (
                <View>
                  <View className="flex-row items-center mb-5">
                    <INatIcon name="location" size={15} />
                    <Body3 className="ml-4">{region.place_guess}</Body3>
                  </View>
                  <Button
                    text={t( "EDIT-LOCATION" )}
                    onPress={() => {
                      closeModal();
                      navigation.navigate( "ExploreLocationSearch" );
                    }}
                    accessibilityLabel={t( "Edit" )}
                  />
                </View>
              )
              : (
                <Button
                  text={t( "SEARCH-FOR-A-LOCATION" )}
                  onPress={() => {
                    closeModal();
                    navigation.navigate( "ExploreLocationSearch" );
                  }}
                  accessibilityLabel={t( "Search" )}
                />
              )}
          </View>
        </View>

        {/* Sort-By Section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "SORT-BY" )}</Heading4>
          <View className="mb-5">
            <Button
              text={sortByButtonText()}
              className="shrink"
              dropdown
              onPress={() => {
                closeModal();
                setShowSortBy( true );
              }}
            />
            {showSortBy && (
              <SortBySheet
                selectedValue={sortBy}
                handleClose={() => setShowSortBy( false )}
                update={updateSortBy}
              />
            )}
          </View>
        </View>
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "USER" )}</Heading4>
          <View className="mb-5">
                <Button
                  text={t( "FILTER-BY-A-USER" )}
                  onPress={() => {
                    closeModal();
                    navigation.navigate( "ExploreUserSearch" );
                  }}
                  accessibilityLabel={t( "Filter" )}
                />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default FilterModal;
