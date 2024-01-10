import { useNavigation } from "@react-navigation/native";
import SortBySheet from "components/Explore/Sheets/SortBySheet";
import {
  Body1,
  Body2,
  Body3,
  Button,
  Checkbox,
  DateTimePicker,
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
import { RadioButtonRow } from "components/SharedComponents/Sheets/RadioButtonSheet";
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
  updateDateObserved: Function,
  updateDateUploaded: Function,
  updateMedia: Function,
  updateIntroduced: Function,
  updateNative: Function,
  updateEndemic: Function,
  updateNoStatus: Function,
  updateWildStatus: Function,
  updateReviewed: Function,
  updatePhotoLicense: Function
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
  updateDateObserved,
  updateDateUploaded,
  updateMedia,
  updateIntroduced,
  updateNative,
  updateEndemic,
  updateNoStatus,
  updateWildStatus,
  updateReviewed,
  updatePhotoLicense
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
    dateObserved,
    // eslint-disable-next-line camelcase
    observed_on,
    month,
    dateUploaded,
    // eslint-disable-next-line camelcase
    created_on,
    media,
    introduced,
    native,
    endemic,
    noStatus,
    wildStatus,
    reviewedFilter,
    photoLicense
  } = exploreFilters;

  const NONE = "NONE";
  const SORT_BY = "SORT_BY";
  const LRANK = "LRANK";
  const HRANK = "HRANK";
  const DATE_OBSERVED = "DATE_OBSERVED";
  const OBSERVED_EXACT = "OBSERVED_EXACT";
  const DATE_UPLOADED = "DATE_UPLOADED";
  const UPLOADED_EXACT = "UPLOADED_EXACT";
  const PHOTO_LICENSING = "PHOTO_LICENSING";
  const [openSheet, setOpenSheet] = useState( NONE );

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
    exactDate: {
      label: t( "Exact-Date" ),
      value: "exactDate"
    },
    months: {
      label: t( "Months" ),
      value: "months"
    }
  };

  const dateUploadedValues = {
    all: {
      label: t( "All" ),
      value: "all"
    },
    exactDate: {
      label: t( "Exact-Date" ),
      value: "exactDate"
    }
  };

  // TODO: use this from i18n or moment ?
  const monthValues = {
    1: {
      label: t( "January" ),
      value: 1
    },
    2: {
      label: t( "February" ),
      value: 2
    },
    3: {
      label: t( "March" ),
      value: 3
    },
    4: {
      label: t( "April" ),
      value: 4
    },
    5: {
      label: t( "May" ),
      value: 5
    },
    6: {
      label: t( "June" ),
      value: 6
    },
    7: {
      label: t( "July" ),
      value: 7
    },
    8: {
      label: t( "August" ),
      value: 8
    },
    9: {
      label: t( "September" ),
      value: 9
    },
    10: {
      label: t( "October" ),
      value: 10
    },
    11: {
      label: t( "November" ),
      value: 11
    },
    12: {
      label: t( "December" ),
      value: 12
    }
  };

  const mediaValues = {
    all: {
      label: t( "All" ),
      value: "all"
    },
    photos: {
      label: t( "Photos" ),
      value: "photos"
    },
    sounds: {
      label: t( "Sounds" ),
      value: "sounds"
    },
    noMedia: {
      label: t( "No-Media" ),
      value: "noMedia"
    }
  };

  const wildValues = {
    all: {
      label: t( "All" ),
      value: "all"
    },
    wild: {
      label: t( "Wild" ),
      value: "wild"
    },
    captive: {
      label: t( "Captive-Cultivated" ),
      value: "captive"
    }
  };

  const reviewedValues = {
    all: {
      label: t( "All-observations" ),
      value: "all"
    },
    reviewed: {
      label: t( "Reviewed-observations-only" ),
      value: "reviewed"
    },
    unreviewed: {
      label: t( "Unreviewed-observations-only" ),
      value: "unreviewed"
    }
  };

  const photoLicensingValues = {
    all: {
      label: t( "All" ),
      value: "all"
    },
    cc0: {
      label: t( "CC0" ),
      value: "cc0"
    },
    ccby: {
      label: t( "CC-BY" ),
      value: "ccby"
    },
    ccbync: {
      label: t( "CC-BY-NC" ),
      value: "ccbync"
    },
    ccbysa: {
      label: t( "CC-BY-SA" ),
      value: "ccbysa"
    },
    ccbynd: {
      label: t( "CC-BY-ND" ),
      value: "ccbynd"
    },
    ccbyncsa: {
      label: t( "CC-BY-NC-SA" ),
      value: "ccbyncsa"
    },
    ccbyncnd: {
      label: t( "CC-BY-NC-ND" ),
      value: "ccbyncnd"
    }
  };

  const updateObservedExact = date => {
    updateDateObserved(
      dateObservedValues.exactDate.value,
      date.toISOString().split( "T" )[0]
    );
  };

  const updateObservedMonths = monthInteger => {
    const newMonths = month.includes( monthInteger )
      ? month.filter( m => m !== monthInteger )
      : [...month, monthInteger];
    updateDateObserved( dateObservedValues.months.value, null, newMonths );
  };

  const updateUploadedExact = date => {
    updateDateUploaded(
      dateUploadedValues.exactDate.value,
      date.toISOString().split( "T" )[0]
    );
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

      <ScrollView className="p-4">
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
                  <DisplayTaxon taxon={taxon} />
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
                setOpenSheet( SORT_BY );
              }}
            />
            {openSheet === SORT_BY && (
              <SortBySheet
                selectedValue={sortBy}
                handleClose={() => setOpenSheet( NONE )}
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
              setOpenSheet( LRANK );
            }}
          />
          {openSheet === LRANK && (
            <RadioButtonSheet
              headerText={t( "TAXONOMIC-RANKS" )}
              confirm={newRank => {
                updateLowestTaxonomicRank( newRank );
                setOpenSheet( NONE );
              }}
              handleClose={() => setOpenSheet( NONE )}
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
              setOpenSheet( HRANK );
            }}
          />
          {openSheet === HRANK && (
            // TODO: change as in Figma designs
            <RadioButtonSheet
              headerText={t( "TAXONOMIC-RANKS" )}
              confirm={newRank => {
                updateHighestTaxonomicRank( newRank );
                setOpenSheet( NONE );
              }}
              handleClose={() => setOpenSheet( NONE )}
              radioValues={taxonomicRankValues}
              selectedValue={hrank}
            />
          )}
        </View>

        {/* Date observed section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "DATE-OBSERVED" )}</Heading4>
          <Button
            text={dateObservedValues[dateObserved]?.label.toUpperCase()}
            className="shrink mb-7"
            dropdown
            onPress={() => {
              closeModal();
              setOpenSheet( DATE_OBSERVED );
            }}
          />
          {dateObserved === dateObservedValues.exactDate.value && (
            <View className="items-center">
              {/* eslint-disable-next-line camelcase */}
              <Body1 className="mb-5">{observed_on}</Body1>
              <Button
                level="primary"
                text={t( "CHANGE-DATE" )}
                className="w-full mb-7"
                onPress={() => {
                  setOpenSheet( OBSERVED_EXACT );
                }}
              />
              <DateTimePicker
                isDateTimePickerVisible={openSheet === OBSERVED_EXACT}
                toggleDateTimePicker={() => setOpenSheet( NONE )}
                onDatePicked={date => updateObservedExact( date )}
              />
            </View>
          )}
          {dateObserved === dateObservedValues.months.value
            && Object.keys( monthValues ).map( monthKey => (
              <View className="flex-row items-center mb-5">
                <Checkbox
                  text={monthValues[monthKey].label}
                  isChecked={month.includes( monthValues[monthKey].value )}
                  onPress={() => updateObservedMonths( monthValues[monthKey].value )}
                />
              </View>
            ) )}
          {openSheet === DATE_OBSERVED && (
            <RadioButtonSheet
              headerText={t( "DATE-OBSERVED" )}
              confirm={newDateObserved => {
                updateDateObserved( newDateObserved );
                setOpenSheet( NONE );
              }}
              handleClose={() => setOpenSheet( NONE )}
              radioValues={dateObservedValues}
              selectedValue={dateObserved}
            />
          )}
        </View>

        {/* Date uploaded section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "DATE-UPLOADED" )}</Heading4>
          <Button
            text={dateUploadedValues[dateUploaded]?.label.toUpperCase()}
            className="shrink mb-7"
            dropdown
            onPress={() => {
              closeModal();
              setOpenSheet( DATE_UPLOADED );
            }}
          />
          {dateUploaded === dateUploadedValues.exactDate.value && (
            <View className="items-center">
              {/* eslint-disable-next-line camelcase */}
              <Body1 className="mb-5">{created_on}</Body1>
              <Button
                level="primary"
                text={t( "CHANGE-DATE" )}
                className="w-full mb-7"
                onPress={() => {
                  setOpenSheet( UPLOADED_EXACT );
                }}
              />
              <DateTimePicker
                isDateTimePickerVisible={openSheet === UPLOADED_EXACT}
                toggleDateTimePicker={() => setOpenSheet( NONE )}
                onDatePicked={date => updateUploadedExact( date )}
              />
            </View>
          )}
          {openSheet === DATE_UPLOADED && (
            <RadioButtonSheet
              headerText={t( "DATE-UPLOADED" )}
              confirm={newDate => {
                updateDateUploaded( newDate );
                setOpenSheet( NONE );
              }}
              handleClose={() => setOpenSheet( NONE )}
              radioValues={dateUploadedValues}
              selectedValue={dateUploaded}
            />
          )}
        </View>

        {/* Media section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "MEDIA" )}</Heading4>
          {Object.keys( mediaValues ).map( mediaKey => (
            <RadioButtonRow
              keySubstring={mediaKey}
              value={mediaValues[mediaKey]}
              checked={mediaValues[mediaKey].value === media}
              onPress={() => updateMedia( mediaValues[mediaKey].value )}
              label={mediaValues[mediaKey].label}
            />
          ) )}
        </View>

        {/* Establishment Means section */}
        <View className="mb-7">
          <Heading4 className="mb-5">
            {t( "TODO: this section does not use state on explore screen" )}
          </Heading4>
          <Heading4 className="mb-5">{t( "ESTABLISHMENT-MEANS" )}</Heading4>
          <Checkbox
            isChecked={introduced}
            onPress={updateIntroduced}
            text={t( "Introduced" )}
          />
          <View className="mb-4" />
          <Checkbox
            isChecked={native}
            onPress={updateNative}
            text={t( "Native" )}
          />
          <View className="mb-4" />
          <Checkbox
            isChecked={endemic}
            onPress={updateEndemic}
            text={t( "Endemic" )}
          />
          <View className="mb-4" />
          <Checkbox
            isChecked={noStatus}
            onPress={updateNoStatus}
            text={t( "No-Status" )}
          />
        </View>

        {/* Wild Status section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "WILD-STATUS" )}</Heading4>
          {Object.keys( wildValues ).map( wildKey => (
            <RadioButtonRow
              keySubstring={wildKey}
              value={wildValues[wildKey]}
              checked={wildValues[wildKey].value === wildStatus}
              onPress={() => updateWildStatus( wildValues[wildKey].value )}
              label={wildValues[wildKey].label}
            />
          ) )}
        </View>

        {/* Reviewed section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "REVIEWED" )}</Heading4>
          {Object.keys( reviewedValues ).map( reviewedKey => (
            <RadioButtonRow
              keySubstring={reviewedKey}
              value={reviewedValues[reviewedKey]}
              checked={reviewedValues[reviewedKey].value === reviewedFilter}
              onPress={() => updateReviewed( reviewedValues[reviewedKey].value )}
              label={reviewedValues[reviewedKey].label}
            />
          ) )}
        </View>

        {/* Photo licensing section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "PHOTO-LICENSING" )}</Heading4>
          <Button
            text={photoLicensingValues[photoLicense]?.label.toUpperCase()}
            className="shrink mb-7"
            dropdown
            onPress={() => {
              closeModal();
              setOpenSheet( PHOTO_LICENSING );
            }}
          />
          {openSheet === PHOTO_LICENSING && (
            <RadioButtonSheet
              headerText={t( "PHOTO-LICENSING" )}
              confirm={newLicense => {
                updatePhotoLicense( newLicense );
                setOpenSheet( NONE );
              }}
              handleClose={() => setOpenSheet( NONE )}
              radioValues={photoLicensingValues}
              selectedValue={photoLicense}
            />
          )}
        </View>
      </ScrollView>
      <Body3 className="text-center mb-10">{t( "TODO: remove this" )}</Body3>
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
