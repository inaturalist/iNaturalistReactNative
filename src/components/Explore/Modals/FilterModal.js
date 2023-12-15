import { useNavigation } from "@react-navigation/native";
import SortBySheet from "components/Explore/Sheets/SortBySheet";
import {
  Body2,
  Body3,
  Button,
  Checkbox,
  DisplayTaxon,
  Heading1,
  Heading4,
  IconicTaxonChooser,
  INatIcon,
  INatIconButton,
  RadioButtonSheet,
  StickyToolbar
} from "components/SharedComponents";
import ProjectListItem from "components/SharedComponents/ProjectListItem";
import UserListItem from "components/SharedComponents/UserListItem";
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
  updateSortBy: Function,
  numberOfFilters: number,
  updateResearchGrade: Function,
  updateNeedsID: Function,
  updateCasual: Function,
  updateLowestTaxonomicRank: Function,
  updateHighestTaxonomicRank: Function,
  updateDateObserved: Function
};

const FilterModal = ( {
  closeModal,
  exploreFilters,
  filtersNotDefault,
  resetFilters,
  updateTaxon,
  updateSortBy,
  numberOfFilters,
  updateResearchGrade,
  updateNeedsID,
  updateCasual,
  updateLowestTaxonomicRank,
  updateHighestTaxonomicRank,
  updateDateObserved
}: Props ): Node => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {
    taxon,
    region,
    sortBy,
    user,
    project,
    researchGrade,
    needsID,
    casual,
    lrank,
    hrank,
    dateObserved
  } = exploreFilters;

  const [showSortBy, setShowSortBy] = useState( false );
  const [showLowerTaxRank, setShowLowerTaxRank] = useState( false );
  const [showHigherTaxRank, setShowHigherTaxRank] = useState( false );
  const [showDateObserved, setShowDateObserved] = useState( false );

  const sortByButtonText = () => {
    switch ( sortBy ) {
      case "DATE_UPLOADED_OLDEST":
        return t( "DATE-UPLOADED-OLDEST" );
      case "DATE_OBSERVED_NEWEST":
        return t( "DATE-OBSERVED-NEWEST" );
      case "DATE_OBSERVED_OLDEST":
        return t( "DATE-OBSERVED-OLDEST" );
      // case "MOST_FAVED":
      //   return t( "MOST-FAVED" );
      case "DATE_UPLOADED_NEWEST":
      default:
        return t( "DATE-UPLOADED-NEWEST" );
    }
  };

  const tUp = key => t( key ).toUpperCase();

  const taxonomicRankValues = {
    kingdom: {
      label: tUp( "Ranks-kingdom" ),
      value: "kingdom"
    },
    phylum: {
      label: tUp( "Ranks-phylum" ),
      value: "phylum"
    },
    subphylum: {
      label: tUp( "Ranks-subphylum" ),
      value: "subphylum"
    },
    superclass: {
      label: tUp( "Ranks-superclass" ),
      value: "superclass"
    },
    class: {
      label: tUp( "Ranks-class" ),
      value: "class"
    },
    subclass: {
      label: tUp( "Ranks-subclass" ),
      value: "subclass"
    },
    infraclass: {
      label: tUp( "Ranks-infraclass" ),
      value: "infraclass"
    },
    subterclass: {
      label: tUp( "Ranks-subterclass" ),
      value: "subterclass"
    },
    superorder: {
      label: tUp( "Ranks-superorder" ),
      value: "superorder"
    },
    order: {
      label: tUp( "Ranks-order" ),
      value: "order"
    },
    suborder: {
      label: tUp( "Ranks-suborder" ),
      value: "suborder"
    },
    infraorder: {
      label: tUp( "Ranks-infraorder" ),
      value: "infraorder"
    },
    parvorder: {
      label: tUp( "Ranks-parvorder" ),
      value: "parvorder"
    },
    zoosection: {
      label: tUp( "Ranks-zoosection" ),
      value: "zoosection"
    },
    zoosubsection: {
      label: tUp( "Ranks-zoosubsection" ),
      value: "zoosubsection"
    },
    superfamily: {
      label: tUp( "Ranks-superfamily" ),
      value: "superfamily"
    },
    epifamily: {
      label: tUp( "Ranks-epifamily" ),
      value: "epifamily"
    },
    family: {
      label: tUp( "Ranks-family" ),
      value: "family"
    },
    subfamily: {
      label: tUp( "Ranks-subfamily" ),
      value: "subfamily"
    },
    supertribe: {
      label: tUp( "Ranks-supertribe" ),
      value: "supertribe"
    },
    tribe: {
      label: tUp( "Ranks-tribe" ),
      value: "tribe"
    },
    subtribe: {
      label: tUp( "Ranks-subtribe" ),
      value: "subtribe"
    },
    genus: {
      label: tUp( "Ranks-genus" ),
      value: "genus"
    },
    genushybrid: {
      label: tUp( "Ranks-genushybrid" ),
      value: "genushybrid"
    },
    subgenus: {
      label: tUp( "Ranks-subgenus" ),
      value: "subgenus"
    },
    section: {
      label: tUp( "Ranks-section" ),
      value: "section"
    },
    subsection: {
      label: tUp( "Ranks-subsection" ),
      value: "subsection"
    },
    complex: {
      label: tUp( "Ranks-complex" ),
      value: "complex"
    },
    species: {
      label: tUp( "Ranks-species" ),
      value: "species"
    },
    hybrid: {
      label: tUp( "Ranks-hybrid" ),
      value: "hybrid"
    },
    subspecies: {
      label: tUp( "Ranks-subspecies" ),
      value: "subspecies"
    },
    variety: {
      label: tUp( "Ranks-variety" ),
      value: "variety"
    },
    form: {
      label: tUp( "Ranks-form" ),
      value: "form"
    },
    infrahybrid: {
      label: tUp( "Ranks-infrahybrid" ),
      value: "infrahybrid"
    }
  };

  const dateObservedValues = {
    all: {
      label: t( "All" ),
      value: "all"
    },
    exactDates: {
      label: t( "Exact-Date" ),
      value: "exactDate"
    },
    months: {
      label: t( "Months" ),
      value: "months"
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
          {numberOfFilters !== 0 && <NumberBadge number={numberOfFilters} />}
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
                <Pressable
                  className="flex-row justify-between items-center"
                  accessibilityRole="button"
                  // TODO: accessibilityLabel={t( "Change user or something like this" )}
                  onPress={() => {
                    closeModal();
                    navigation.navigate( "ExploreTaxonSearch" );
                  }}
                >
                  <DisplayTaxon
                    taxon={taxon}
                  />
                  <INatIcon name="edit" size={22} />
                </Pressable>

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

        {/* Quality Grade Section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "QUALITY-GRADE" )}</Heading4>
          <View className="mb-5">
            <Checkbox
              text={t( "Research-Grade" )}
              isChecked={researchGrade}
              onPress={updateResearchGrade}
            />
            <View className="mb-4" />
            <Checkbox
              text={t( "Needs-ID" )}
              isChecked={needsID}
              onPress={updateNeedsID}
            />
            <View className="mb-4" />
            <Checkbox
              text={t( "Casual" )}
              isChecked={casual}
              onPress={updateCasual}
            />
          </View>
        </View>

        {/* User Section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "USER" )}</Heading4>
          <View className="mb-5">
            {user
              ? (
                <Pressable
                  className="flex-row justify-between items-center"
                  accessibilityRole="button"
                  // TODO: accessibilityLabel={t( "Change user or something like this" )}
                  onPress={() => {
                    closeModal();
                    navigation.navigate( "ExploreUserSearch" );
                  }}
                >
                  <UserListItem
                    item={{ user }}
                    count={user.observations_count}
                    countText="X-Observations"
                  />
                  <INatIcon name="edit" size={22} />
                </Pressable>
              )
              : (
                <Button
                  text={t( "FILTER-BY-A-USER" )}
                  onPress={() => {
                    closeModal();
                    navigation.navigate( "ExploreUserSearch" );
                  }}
                  accessibilityLabel={t( "Filter" )}
                />
              )}
          </View>
        </View>

        {/* Project Section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "PROJECT" )}</Heading4>
          <View className="mb-5">
            {project
              ? (
                <Pressable
                  className="flex-row justify-between items-center"
                  accessibilityRole="button"
                  // TODO: accessibilityLabel={t( "Change project or something like this" )}
                  onPress={() => {
                    closeModal();
                    navigation.navigate( "ExploreProjectSearch" );
                  }}
                >
                  <ProjectListItem item={project} />
                  <INatIcon name="edit" size={22} />
                </Pressable>
              )
              : (
                <Button
                  text={t( "FILTER-BY-A-PROJECT" )}
                  onPress={() => {
                    closeModal();
                    navigation.navigate( "ExploreProjectSearch" );
                  }}
                  accessibilityLabel={t( "Filter" )}
                />
              )}
          </View>
        </View>

        {/* Taxonomic Ranks section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "TAXONOMIC-RANKS" )}</Heading4>
          <Body2 className="ml-1 mb-3">{t( "Lowest" )}</Body2>
          <Button
            text={lrank
              ? taxonomicRankValues[lrank]?.label
              : t( "ALL" )}
            className="shrink mb-7"
            dropdown
            onPress={() => {
              closeModal();
              setShowLowerTaxRank( true );
            }}
          />
          {showLowerTaxRank && (
            <RadioButtonSheet
              headerText={t( "TAXONOMIC-RANKS" )}
              confirm={newRank => {
                updateLowestTaxonomicRank( newRank );
                setShowLowerTaxRank( false );
              }}
              handleClose={() => setShowLowerTaxRank( false )}
              radioValues={taxonomicRankValues}
              selectedValue={lrank}
            />
          )}
          <Body2 className="ml-1 mb-3">{t( "Highest" )}</Body2>
          <Button
            text={hrank
              ? taxonomicRankValues[hrank]?.label
              : t( "ALL" )}
            className="shrink mb-7"
            dropdown
            onPress={() => {
              closeModal();
              setShowHigherTaxRank( true );
            }}
          />
          {showHigherTaxRank && (
            <RadioButtonSheet
              headerText={t( "TAXONOMIC-RANKS" )}
              confirm={newRank => {
                updateHighestTaxonomicRank( newRank );
                setShowHigherTaxRank( false );
              }}
              handleClose={() => setShowHigherTaxRank( false )}
              radioValues={taxonomicRankValues}
              selectedValue={hrank}
            />
          )}

        {/* Date observed section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "DATE-OBSERVED" )}</Heading4>
          {showDateObserved && (
            <RadioButtonSheet
              headerText={t( "DATE-OBSERVED" )}
              confirm={newDateObserved => {
                updateDateObserved( newDateObserved );
                setShowDateObserved( false );
              }}
              handleClose={() => setShowHigherTaxRank( false )}
              radioValues={dateObservedValues}
              selectedValue={dateObserved}
            />
          )}
        </View>
        </View>
      </ScrollView>
      <StickyToolbar>
        <View className="flex-1 flex-row items-center">
          <INatIconButton
            icon="chevron-left"
            onPress={closeModal}
            size={22}
            accessibilityLabel={t( "Back" )}
          />
          <Button
            className="flex-1 ml-5"
            text={t( "APPLY-FILTERS" )}
            onPress={closeModal}
          />
        </View>
      </StickyToolbar>
    </View>
  );
};

export default FilterModal;
