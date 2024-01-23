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
  RadioButtonRow,
  RadioButtonSheet,
  StickyToolbar,
  WarningSheet
} from "components/SharedComponents";
import ProjectListItem from "components/SharedComponents/ProjectListItem";
import UserListItem from "components/SharedComponents/UserListItem";
import { Pressable, ScrollView, View } from "components/styledComponents";
import {
  DATE_OBSERVED,
  DATE_UPLOADED,
  EXPLORE_ACTION,
  MEDIA,
  PHOTO_LICENSE,
  REVIEWED,
  SORT_BY,
  TAXONOMIC_RANK,
  useExplore,
  WILD_STATUS
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, { useState } from "react";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import { getShadowStyle } from "styles/global";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 4,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 6
} );

const NumberBadge = ( { number } ): Node => {
  const theme = useTheme();
  return (
    <View
      className="ml-3 w-5 h-5 justify-center items-center rounded-full bg-inatGreen"
      style={getShadow( theme.colors.primary )}
    >
      <Body3 className="text-white">{number}</Body3>
    </View>
  );
};

type Props = {
  closeModal: Function,
  updateTaxon: Function,
};

const FilterModal = ( {
  closeModal,
  updateTaxon
}: Props ): Node => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const {
    state,
    dispatch,
    filtersNotDefault,
    numberOfFilters,
    differsFromSnapshot,
    discardChanges
  } = useExplore();
  const {
    taxon,
    place_guess: placeGuess,
    user,
    project,
    sortBy,
    researchGrade,
    needsID,
    casual,
    hrank,
    lrank,
    dateObserved,
    // eslint-disable-next-line camelcase
    observed_on,
    months,
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
  } = state;

  const NONE = "NONE";
  const SORT_BY_M = "SORT_BY_M";
  const LRANK = "LRANK";
  const HRANK = "HRANK";
  const DATE_OBSERVED_M = "DATE_OBSERVED_M";
  const OBSERVED_EXACT = "OBSERVED_EXACT";
  const DATE_UPLOADED_M = "DATE_UPLOADED_M";
  const UPLOADED_EXACT = "UPLOADED_EXACT";
  const PHOTO_LICENSING = "PHOTO_LICENSING";
  const CONFIRMATION = "CONFIRMATION";
  const [openSheet, setOpenSheet] = useState( NONE );

  const sortByButtonText = () => {
    switch ( sortBy ) {
      case SORT_BY.DATE_UPLOADED_OLDEST:
        return t( "DATE-UPLOADED-OLDEST" );
      case SORT_BY.DATE_OBSERVED_NEWEST:
        return t( "DATE-OBSERVED-NEWEST" );
      case SORT_BY.DATE_OBSERVED_OLDEST:
        return t( "DATE-OBSERVED-OLDEST" );
      case SORT_BY.MOST_FAVED:
        return t( "MOST-FAVED" );
      case SORT_BY.DATE_UPLOADED_NEWEST:
      default:
        return t( "DATE-UPLOADED-NEWEST" );
    }
  };

  const tUp = key => t( key ).toUpperCase();

  const taxonomicRankValues = {
    [TAXONOMIC_RANK.kingdom]: {
      label: tUp( "Ranks-kingdom" ),
      value: TAXONOMIC_RANK.kingdom
    },
    [TAXONOMIC_RANK.phylum]: {
      label: tUp( "Ranks-phylum" ),
      value: TAXONOMIC_RANK.phylum
    },
    [TAXONOMIC_RANK.subphylum]: {
      label: tUp( "Ranks-subphylum" ),
      value: TAXONOMIC_RANK.subphylum
    },
    [TAXONOMIC_RANK.superclass]: {
      label: tUp( "Ranks-superclass" ),
      value: TAXONOMIC_RANK.superclass
    },
    [TAXONOMIC_RANK.class]: {
      label: tUp( "Ranks-class" ),
      value: TAXONOMIC_RANK.class
    },
    [TAXONOMIC_RANK.subclass]: {
      label: tUp( "Ranks-subclass" ),
      value: TAXONOMIC_RANK.subclass
    },
    [TAXONOMIC_RANK.infraclass]: {
      label: tUp( "Ranks-infraclass" ),
      value: TAXONOMIC_RANK.infraclass
    },
    [TAXONOMIC_RANK.subterclass]: {
      label: tUp( "Ranks-subterclass" ),
      value: TAXONOMIC_RANK.subterclass
    },
    [TAXONOMIC_RANK.superorder]: {
      label: tUp( "Ranks-superorder" ),
      value: TAXONOMIC_RANK.superorder
    },
    [TAXONOMIC_RANK.order]: {
      label: tUp( "Ranks-order" ),
      value: TAXONOMIC_RANK.order
    },
    [TAXONOMIC_RANK.suborder]: {
      label: tUp( "Ranks-suborder" ),
      value: TAXONOMIC_RANK.suborder
    },
    [TAXONOMIC_RANK.infraorder]: {
      label: tUp( "Ranks-infraorder" ),
      value: TAXONOMIC_RANK.infraorder
    },
    [TAXONOMIC_RANK.parvorder]: {
      label: tUp( "Ranks-parvorder" ),
      value: TAXONOMIC_RANK.parvorder
    },
    [TAXONOMIC_RANK.zoosection]: {
      label: tUp( "Ranks-zoosection" ),
      value: TAXONOMIC_RANK.zoosection
    },
    [TAXONOMIC_RANK.zoosubsection]: {
      label: tUp( "Ranks-zoosubsection" ),
      value: TAXONOMIC_RANK.zoosubsection
    },
    [TAXONOMIC_RANK.superfamily]: {
      label: tUp( "Ranks-superfamily" ),
      value: TAXONOMIC_RANK.superfamily
    },
    [TAXONOMIC_RANK.epifamily]: {
      label: tUp( "Ranks-epifamily" ),
      value: TAXONOMIC_RANK.epifamily
    },
    [TAXONOMIC_RANK.family]: {
      label: tUp( "Ranks-family" ),
      value: TAXONOMIC_RANK.family
    },
    [TAXONOMIC_RANK.subfamily]: {
      label: tUp( "Ranks-subfamily" ),
      value: TAXONOMIC_RANK.subfamily
    },
    [TAXONOMIC_RANK.supertribe]: {
      label: tUp( "Ranks-supertribe" ),
      value: TAXONOMIC_RANK.supertribe
    },
    [TAXONOMIC_RANK.tribe]: {
      label: tUp( "Ranks-tribe" ),
      value: TAXONOMIC_RANK.tribe
    },
    [TAXONOMIC_RANK.subtribe]: {
      label: tUp( "Ranks-subtribe" ),
      value: TAXONOMIC_RANK.subtribe
    },
    [TAXONOMIC_RANK.genus]: {
      label: tUp( "Ranks-genus" ),
      value: TAXONOMIC_RANK.genus
    },
    [TAXONOMIC_RANK.genushybrid]: {
      label: tUp( "Ranks-genushybrid" ),
      value: TAXONOMIC_RANK.genushybrid
    },
    [TAXONOMIC_RANK.subgenus]: {
      label: tUp( "Ranks-subgenus" ),
      value: TAXONOMIC_RANK.subgenus
    },
    [TAXONOMIC_RANK.section]: {
      label: tUp( "Ranks-section" ),
      value: TAXONOMIC_RANK.section
    },
    [TAXONOMIC_RANK.subsection]: {
      label: tUp( "Ranks-subsection" ),
      value: TAXONOMIC_RANK.subsection
    },
    [TAXONOMIC_RANK.complex]: {
      label: tUp( "Ranks-complex" ),
      value: TAXONOMIC_RANK.complex
    },
    [TAXONOMIC_RANK.species]: {
      label: tUp( "Ranks-species" ),
      value: TAXONOMIC_RANK.species
    },
    [TAXONOMIC_RANK.hybrid]: {
      label: tUp( "Ranks-hybrid" ),
      value: TAXONOMIC_RANK.hybrid
    },
    [TAXONOMIC_RANK.subspecies]: {
      label: tUp( "Ranks-subspecies" ),
      value: TAXONOMIC_RANK.subspecies
    },
    [TAXONOMIC_RANK.variety]: {
      label: tUp( "Ranks-variety" ),
      value: TAXONOMIC_RANK.variety
    },
    [TAXONOMIC_RANK.form]: {
      label: tUp( "Ranks-form" ),
      value: TAXONOMIC_RANK.form
    },
    [TAXONOMIC_RANK.infrahybrid]: {
      label: tUp( "Ranks-infrahybrid" ),
      value: TAXONOMIC_RANK.infrahybrid
    }
  };

  const dateObservedValues = {
    [DATE_OBSERVED.ALL]: {
      label: t( "All" ),
      value: DATE_OBSERVED.ALL
    },
    [DATE_OBSERVED.EXACT_DATE]: {
      label: t( "Exact-Date" ),
      text: t( "Filter-by-observed-on-date" ),
      value: DATE_OBSERVED.EXACT_DATE
    },
    [DATE_OBSERVED.MONTHS]: {
      label: t( "Months" ),
      text: t( "Filter-by-observed-during-months" ),
      value: DATE_OBSERVED.MONTHS
    }
  };

  const dateUploadedValues = {
    [DATE_UPLOADED.ALL]: {
      label: t( "All" ),
      value: DATE_UPLOADED.ALL
    },
    [DATE_UPLOADED.EXACT_DATE]: {
      label: t( "Exact-Date" ),
      text: t( "Filter-by-uploaded-on-date" ),
      value: DATE_UPLOADED.EXACT_DATE
    }
  };

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
    [MEDIA.ALL]: {
      label: t( "All" ),
      value: MEDIA.ALL
    },
    [MEDIA.PHOTOS]: {
      label: t( "Photos" ),
      value: MEDIA.PHOTOS
    },
    [MEDIA.SOUNDS]: {
      label: t( "Sounds" ),
      value: MEDIA.SOUNDS
    },
    [MEDIA.NONE]: {
      label: t( "No-Media" ),
      value: MEDIA.NONE
    }
  };

  const wildValues = {
    [WILD_STATUS.ALL]: {
      label: t( "All" ),
      value: WILD_STATUS.ALL
    },
    [WILD_STATUS.WILD]: {
      label: t( "Wild" ),
      value: WILD_STATUS.WILD
    },
    [WILD_STATUS.CAPTIVE]: {
      label: t( "Captive-Cultivated" ),
      value: WILD_STATUS.CAPTIVE
    }
  };

  const reviewedValues = {
    [REVIEWED.ALL]: {
      label: t( "All-observations" ),
      value: REVIEWED.ALL
    },
    [REVIEWED.REVIEWED]: {
      label: t( "Reviewed-observations-only" ),
      value: REVIEWED.REVIEWED
    },
    [REVIEWED.UNREVIEWED]: {
      label: t( "Unreviewed-observations-only" ),
      value: REVIEWED.UNREVIEWED
    }
  };

  const photoLicensingValues = {
    [PHOTO_LICENSE.ALL]: {
      label: t( "All" ),
      value: PHOTO_LICENSE.ALL
    },
    [PHOTO_LICENSE.CC0]: {
      label: t( "CC0" ),
      value: PHOTO_LICENSE.CC0
    },
    [PHOTO_LICENSE.CCBY]: {
      label: t( "CC-BY" ),
      value: PHOTO_LICENSE.CCBY
    },
    [PHOTO_LICENSE.CCBYNC]: {
      label: t( "CC-BY-NC" ),
      value: PHOTO_LICENSE.CCBYNC
    },
    [PHOTO_LICENSE.CCBYSA]: {
      label: t( "CC-BY-SA" ),
      value: PHOTO_LICENSE.CCBYSA
    },
    [PHOTO_LICENSE.CCBYND]: {
      label: t( "CC-BY-ND" ),
      value: PHOTO_LICENSE.CCBYND
    },
    [PHOTO_LICENSE.CCBYNCSA]: {
      label: t( "CC-BY-NC-SA" ),
      value: PHOTO_LICENSE.CCBYNCSA
    },
    [PHOTO_LICENSE.CCBYNCND]: {
      label: t( "CC-BY-NC-ND" ),
      value: PHOTO_LICENSE.CCBYNCND
    }
  };

  const updateDateObserved = ( newDateObserved, d1, newMonths ) => {
    const today = new Date( ).toISOString( ).split( "T" )[0];
    // Array with the numbers from 1 to 12
    const allMonths = new Array( 12 ).fill( 0 ).map( ( _, i ) => i + 1 );

    if ( newDateObserved === DATE_OBSERVED.ALL ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_DATE_OBSERVED_ALL
      } );
    } else if ( newDateObserved === DATE_OBSERVED.EXACT_DATE ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_DATE_OBSERVED_EXACT,
        observed_on: d1 || today
      } );
    } else if ( newDateObserved === DATE_OBSERVED.MONTHS ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_DATE_OBSERVED_MONTHS,
        months: newMonths || allMonths
      } );
    }
  };

  const updateObservedExact = date => {
    updateDateObserved(
      DATE_OBSERVED.EXACT_DATE,
      date.toISOString().split( "T" )[0]
    );
  };

  const updateObservedMonths = monthInteger => {
    const newMonths = months.includes( monthInteger )
      ? months.filter( m => m !== monthInteger )
      : [...months, monthInteger];
    updateDateObserved( DATE_OBSERVED.MONTHS, null, newMonths );
  };

  const updateDateUploaded = ( newDateObserved, d1 ) => {
    const today = new Date().toISOString().split( "T" )[0];
    if ( newDateObserved === DATE_UPLOADED.ALL ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_DATE_UPLOADED_ALL
      } );
    } else if ( newDateObserved === DATE_UPLOADED.EXACT_DATE ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_DATE_UPLOADED_EXACT,
        created_on: d1 || today
      } );
    }
  };

  const theme = useTheme();

  return (
    <View className="flex-1 bg-white" testID="filter-modal">
      {/* Header */}
      <View
        className="flex-row items-center p-5 justify-between bg-white"
        style={getShadow( theme.colors.primary )}
      >
        <View className="flex-row items-center">
          <INatIcon name="sliders" size={20} />
          <Heading1 className="ml-3">{t( "Explore-Filters" )}</Heading1>
          {numberOfFilters !== 0 && <NumberBadge number={numberOfFilters} />}
        </View>
        {filtersNotDefault
          ? (
            <Body3
              accessibilityRole="button"
              onPress={() => dispatch( { type: EXPLORE_ACTION.RESET } )}
            >
              {t( "Reset" )}
            </Body3>
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
                  accessibilityLabel={t( "Change-taxon" )}
                  onPress={() => {
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
            {placeGuess
              ? (
                <View>
                  <View className="flex-row items-center mb-5">
                    <INatIcon name="location" size={15} />
                    <Body3 className="ml-4">{placeGuess}</Body3>
                  </View>
                  <Button
                    text={t( "EDIT-LOCATION" )}
                    onPress={() => {
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
                setOpenSheet( SORT_BY_M );
              }}
              accessibilityLabel={t( "Sort-by" )}
            />
            {openSheet === SORT_BY_M && (
              <SortBySheet
                selectedValue={sortBy}
                handleClose={() => setOpenSheet( NONE )}
                update={newSortBy => dispatch( {
                  type: EXPLORE_ACTION.CHANGE_SORT_BY,
                  sortBy: newSortBy
                } )}
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
              onPress={() => dispatch( { type: EXPLORE_ACTION.TOGGLE_RESEARCH_GRADE } )}
            />
            <View className="mb-4" />
            <Checkbox
              text={t( "Needs-ID" )}
              isChecked={needsID}
              onPress={() => dispatch( { type: EXPLORE_ACTION.TOGGLE_NEEDS_ID } )}
            />
            <View className="mb-4" />
            <Checkbox
              text={t( "Casual" )}
              isChecked={casual}
              onPress={() => dispatch( { type: EXPLORE_ACTION.TOGGLE_CASUAL } )}
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
                  accessibilityLabel={t( "Change-user" )}
                  onPress={() => {
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
                  accessibilityLabel={t( "Change-project" )}
                  onPress={() => {
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
              setOpenSheet( LRANK );
            }}
            accessibilityLabel={t( "Lowest" )}
          />
          {openSheet === LRANK && (
            <RadioButtonSheet
              headerText={t( "TODO: this sheet needs to be scrollable" )}
              // headerText={t( "TAXONOMIC-RANKS" )}
              confirm={newRank => {
                dispatch( {
                  type: EXPLORE_ACTION.SET_LOWEST_TAXONOMIC_RANK,
                  lrank: newRank
                } );
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
              setOpenSheet( HRANK );
            }}
            accessibilityLabel={t( "Highest" )}
          />
          {openSheet === HRANK && (
            // TODO: scrollable sheet
            <RadioButtonSheet
              headerText={t( "TODO: this sheet needs to be scrollable" )}
              // headerText={t( "TAXONOMIC-RANKS" )}
              confirm={newRank => {
                dispatch( {
                  type: EXPLORE_ACTION.SET_HIGHEST_TAXONOMIC_RANK,
                  hrank: newRank
                } );
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
              setOpenSheet( DATE_OBSERVED_M );
            }}
            accessibilityLabel={t( "Date-observed" )}
          />
          {dateObserved === DATE_OBSERVED.EXACT_DATE && (
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
                accessibilityLabel={t( "Change-date" )}
              />
              <DateTimePicker
                isDateTimePickerVisible={openSheet === OBSERVED_EXACT}
                toggleDateTimePicker={() => setOpenSheet( NONE )}
                onDatePicked={date => updateObservedExact( date )}
              />
            </View>
          )}
          {dateObserved === DATE_OBSERVED.MONTHS
            && Object.keys( monthValues ).map( monthKey => (
              <View key={monthKey} className="flex-row items-center mb-5">
                <Checkbox
                  text={monthValues[monthKey].label}
                  isChecked={months.includes( monthValues[monthKey].value )}
                  onPress={() => updateObservedMonths( monthValues[monthKey].value )}
                />
              </View>
            ) )}
          {openSheet === DATE_OBSERVED_M && (
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
              setOpenSheet( DATE_UPLOADED_M );
            }}
            accessibilityLabel={t( "Date-uploaded" )}
          />
          {dateUploaded === DATE_UPLOADED.EXACT_DATE && (
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
                accessibilityLabel={t( "Change-date" )}
              />
              <DateTimePicker
                isDateTimePickerVisible={openSheet === UPLOADED_EXACT}
                toggleDateTimePicker={() => setOpenSheet( NONE )}
                onDatePicked={date => updateDateUploaded(
                  DATE_UPLOADED.EXACT_DATE,
                  date.toISOString().split( "T" )[0]
                )}
              />
            </View>
          )}
          {openSheet === DATE_UPLOADED_M && (
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
              key={mediaKey}
              value={mediaValues[mediaKey]}
              checked={mediaValues[mediaKey].value === media}
              onPress={() => dispatch( {
                type: EXPLORE_ACTION.SET_MEDIA,
                media: mediaValues[mediaKey].value
              } )}
              label={mediaValues[mediaKey].label}
            />
          ) )}
        </View>

        {/* Establishment Means section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "ESTABLISHMENT-MEANS" )}</Heading4>
          <Checkbox
            isChecked={introduced}
            onPress={() => dispatch( {
              type: EXPLORE_ACTION.TOGGLE_INTRODUCED
            } )}
            text={t( "Introduced" )}
          />
          <View className="mb-4" />
          <Checkbox
            isChecked={native}
            onPress={() => dispatch( {
              type: EXPLORE_ACTION.TOGGLE_NATIVE
            } )}
            text={t( "Native" )}
          />
          <View className="mb-4" />
          <Checkbox
            isChecked={endemic}
            onPress={() => dispatch( {
              type: EXPLORE_ACTION.TOGGLE_ENDEMIC
            } )}
            text={t( "Endemic" )}
          />
          <View className="mb-4" />
          <Checkbox
            isChecked={noStatus}
            onPress={() => dispatch( {
              type: EXPLORE_ACTION.TOGGLE_NO_STATUS
            } )}
            text={t( "TODO: No-Status (does not change API request atm)" )}
            // text={t( "No-Status" )}
          />
        </View>

        {/* Wild Status section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "WILD-STATUS" )}</Heading4>
          {Object.keys( wildValues ).map( wildKey => (
            <RadioButtonRow
              key={wildKey}
              value={wildValues[wildKey]}
              checked={wildValues[wildKey].value === wildStatus}
              onPress={() => dispatch( {
                type: EXPLORE_ACTION.SET_WILD_STATUS,
                wildStatus: wildValues[wildKey].value
              } )}
              label={wildValues[wildKey].label}
            />
          ) )}
        </View>

        {/* Reviewed section */}
        <View className="mb-7">
          <Heading4 className="mb-5">{t( "REVIEWED" )}</Heading4>
          {Object.keys( reviewedValues ).map( reviewedKey => (
            <RadioButtonRow
              key={reviewedKey}
              value={reviewedValues[reviewedKey]}
              checked={reviewedValues[reviewedKey].value === reviewedFilter}
              onPress={() => dispatch( {
                type: EXPLORE_ACTION.SET_REVIEWED,
                reviewedFilter: reviewedValues[reviewedKey].value
              } )}
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
              setOpenSheet( PHOTO_LICENSING );
            }}
            accessibilityLabel={t( "Photo-licensing" )}
          />
          {openSheet === PHOTO_LICENSING && (
            <RadioButtonSheet
              headerText={t( "PHOTO-LICENSING" )}
              confirm={newLicense => {
                dispatch( {
                  type: EXPLORE_ACTION.SET_PHOTO_LICENSE,
                  photoLicense: newLicense
                } );
                setOpenSheet( NONE );
              }}
              handleClose={() => setOpenSheet( NONE )}
              radioValues={photoLicensingValues}
              selectedValue={photoLicense}
            />
          )}
        </View>
      </ScrollView>
      {/* This view is to offset the absolute StickyToolbar below */}
      <View className="mb-10" />
      <StickyToolbar>
        <View className="flex-1 flex-row items-center">
          <INatIconButton
            icon="chevron-left"
            onPress={
              !differsFromSnapshot
                ? () => {
                  discardChanges();
                  closeModal();
                }
                : () => {
                  setOpenSheet( CONFIRMATION );
                }
            }
            size={22}
            accessibilityLabel={t( "Back" )}
          />
          <Button
            disabled={!differsFromSnapshot}
            className="flex-1 ml-5"
            level="focus"
            text={t( "APPLY-FILTERS" )}
            onPress={closeModal}
            accessibilityLabel={t( "Apply-filters" )}
            accessibilityState={{ disabled: !differsFromSnapshot }}
          />
        </View>
        {openSheet === CONFIRMATION && (
          <WarningSheet
            handleClose={() => setOpenSheet( NONE )}
            confirm={( ) => {
              discardChanges();
              closeModal();
            }}
            headerText={t( "DISCARD-FILTER-CHANGES" )}
            text={t( "You-changed-filters-will-be-discarded" )}
            buttonText={t( "DISCARD-CHANGES" )}
            handleSecondButtonPress={( ) => setOpenSheet( NONE )}
            secondButtonText={t( "CANCEL" )}
          />
        )}
      </StickyToolbar>
    </View>
  );
};

export default FilterModal;
