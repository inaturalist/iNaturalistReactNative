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
import {
  DATE_OBSERVED,
  DATE_UPLOADED,
  EXPLORE_ACTION,
  MEDIA,
  useExplore
} from "providers/ExploreContext.tsx";
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
  updateTaxon: Function,
};

const FilterModal = ( {
  closeModal,
  exploreFilters,
  updateTaxon
}: Props ): Node => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {
    taxon,
    region
  } = exploreFilters;

  const {
    state, dispatch, filtersNotDefault, numberOfFilters
  } = useExplore();
  const {
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
  } = state.exploreParams;

  const NONE = "NONE";
  const SORT_BY = "SORT_BY";
  const LRANK = "LRANK";
  const HRANK = "HRANK";
  const DATE_OBSERVED_M = "DATE_OBSERVED_M";
  const OBSERVED_EXACT = "OBSERVED_EXACT";
  const DATE_UPLOADED_M = "DATE_UPLOADED_M";
  const UPLOADED_EXACT = "UPLOADED_EXACT";
  const PHOTO_LICENSING = "PHOTO_LICENSING";
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
    }
    // epifamily: {
    //   label: tUp( "Ranks-epifamily" ),
    //   value: "epifamily"
    // },
    // family: {
    //   label: tUp( "Ranks-family" ),
    //   value: "family"
    // },
    // subfamily: {
    //   label: tUp( "Ranks-subfamily" ),
    //   value: "subfamily"
    // },
    // supertribe: {
    //   label: tUp( "Ranks-supertribe" ),
    //   value: "supertribe"
    // },
    // tribe: {
    //   label: tUp( "Ranks-tribe" ),
    //   value: "tribe"
    // },
    // subtribe: {
    //   label: tUp( "Ranks-subtribe" ),
    //   value: "subtribe"
    // },
    // genus: {
    //   label: tUp( "Ranks-genus" ),
    //   value: "genus"
    // },
    // genushybrid: {
    //   label: tUp( "Ranks-genushybrid" ),
    //   value: "genushybrid"
    // },
    // subgenus: {
    //   label: tUp( "Ranks-subgenus" ),
    //   value: "subgenus"
    // },
    // section: {
    //   label: tUp( "Ranks-section" ),
    //   value: "section"
    // },
    // subsection: {
    //   label: tUp( "Ranks-subsection" ),
    //   value: "subsection"
    // },
    // complex: {
    //   label: tUp( "Ranks-complex" ),
    //   value: "complex"
    // },
    // species: {
    //   label: tUp( "Ranks-species" ),
    //   value: "species"
    // },
    // hybrid: {
    //   label: tUp( "Ranks-hybrid" ),
    //   value: "hybrid"
    // },
    // subspecies: {
    //   label: tUp( "Ranks-subspecies" ),
    //   value: "subspecies"
    // },
    // variety: {
    //   label: tUp( "Ranks-variety" ),
    //   value: "variety"
    // },
    // form: {
    //   label: tUp( "Ranks-form" ),
    //   value: "form"
    // },
    // infrahybrid: {
    //   label: tUp( "Ranks-infrahybrid" ),
    //   value: "infrahybrid"
    // }
  };

  const dateObservedValues = {
    all: {
      label: t( "All" ),
      value: DATE_OBSERVED.ALL
    },
    exactDate: {
      label: t( "Exact-Date" ),
      value: DATE_OBSERVED.EXACT_DATE
    },
    months: {
      label: t( "Months" ),
      value: DATE_OBSERVED.MONTHS
    }
  };

  const dateUploadedValues = {
    all: {
      label: t( "All" ),
      value: DATE_UPLOADED.ALL
    },
    exactDate: {
      label: t( "Exact-Date" ),
      value: DATE_UPLOADED.EXACT_DATE
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
      value: MEDIA.ALL
    },
    photos: {
      label: t( "Photos" ),
      value: MEDIA.PHOTOS
    },
    sounds: {
      label: t( "Sounds" ),
      value: MEDIA.SOUNDS
    },
    noMedia: {
      label: t( "No-Media" ),
      value: MEDIA.NONE
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
      dateObservedValues.exactDate.value,
      date.toISOString().split( "T" )[0]
    );
  };

  const updateObservedMonths = monthInteger => {
    const newMonths = months.includes( monthInteger )
      ? months.filter( m => m !== monthInteger )
      : [...months, monthInteger];
    updateDateObserved( dateObservedValues.months.value, null, newMonths );
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
            <Body3 onPress={() => dispatch( { type: EXPLORE_ACTION.RESET } )}>
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
                  // TODO: accessibilityLabel={t( "Change user or something like this" )}
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
                setOpenSheet( SORT_BY );
              }}
            />
            {openSheet === SORT_BY && (
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
                  // TODO: accessibilityLabel={t( "Change user or something like this" )}
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
                  // TODO: accessibilityLabel={t( "Change project or something like this" )}
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
          />
          {openSheet === LRANK && (
            <RadioButtonSheet
              headerText={t( "TAXONOMIC-RANKS" )}
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
          />
          {openSheet === HRANK && (
            // TODO: change as in Figma designs
            <RadioButtonSheet
              headerText={t( "TAXONOMIC-RANKS" )}
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
                onDatePicked={date => updateDateUploaded(
                  dateUploadedValues.exactDate.value,
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
          <Heading4 className="mb-5">
            {t( "TODO: this section does not use state on explore screen" )}
          </Heading4>
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
            text={t( "No-Status" )}
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
