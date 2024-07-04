import classNames from "classnames";
import NumberBadge from "components/Explore/NumberBadge.tsx";
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
  List2,
  PickerSheet,
  ProjectListItem,
  RadioButtonRow,
  RadioButtonSheet,
  StickyToolbar,
  ViewWrapper,
  WarningSheet
} from "components/SharedComponents";
import UserListItem from "components/SharedComponents/UserListItem";
import { Pressable, ScrollView, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import {
  DATE_OBSERVED,
  DATE_UPLOADED,
  ESTABLISHMENT_MEAN,
  EXPLORE_ACTION,
  MEDIA,
  PHOTO_LICENSE,
  REVIEWED,
  SORT_BY,
  TAXONOMIC_RANK,
  useExplore,
  WILD_STATUS
} from "providers/ExploreContext.tsx";
import React, { useState } from "react";
import { useTheme } from "react-native-paper";
import { useCurrentUser, useTranslation } from "sharedHooks";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

import ExploreLocationSearchModal from "./ExploreLocationSearchModal";
import ExploreProjectSearchModal from "./ExploreProjectSearchModal";
import ExploreTaxonSearchModal from "./ExploreTaxonSearchModal";
import ExploreUserSearchModal from "./ExploreUserSearchModal";

const DROP_SHADOW = getShadowForColor( colors.darkGray, {
  offsetHeight: 4,
  elevation: 6
} );

const { useRealm } = RealmContext;

interface Props {
  closeModal: () => void;
  filterByIconicTaxonUnknown: () => void;
  updateTaxon: ( _taxon: Object | null ) => void;
  // TODO: Param not typed yet, because ExploreLocationSearch is not typed yet
  updateLocation: ( _location: any ) => void;
  // TODO: Param not typed yet, because ExploreUserSearch is not typed yet
  updateUser: ( _user: any ) => void;
  // TODO: Param not typed yet, because ExploreProjectSearch is not typed yet
  updateProject: ( _project: any ) => void;
}

const FilterModal = ( {
  closeModal,
  filterByIconicTaxonUnknown,
  updateTaxon,
  updateLocation,
  updateUser,
  updateProject
}: Props ) => {
  const { t } = useTranslation();
  const realm = useRealm();
  const currentUser = useCurrentUser();

  const {
    state,
    dispatch,
    differsFromSnapshot,
    discardChanges,
    isNotInitialState,
    numberOfFilters,
    defaultExploreLocation
  } = useExplore();
  const {
    casual,
    created_d1: createdD1,
    created_d2: createdD2,
    created_on: createdOn,
    d1,
    d2,
    dateObserved,
    dateUploaded,
    establishmentMean,
    hrank,
    iconic_taxa: iconicTaxonNames,
    lrank,
    media,
    months,
    needsID,
    observed_on: observedOn,
    photoLicense,
    place_guess: placeGuess,
    project,
    researchGrade,
    reviewedFilter,
    sortBy,
    taxon,
    user,
    wildStatus
  } = state;

  const NONE = "NONE";
  const SORT_BY_M = "SORT_BY_M";
  const LRANK = "LRANK";
  const HRANK = "HRANK";
  const DATE_OBSERVED_M = "DATE_OBSERVED_M";
  const OBSERVED_EXACT = "OBSERVED_EXACT";
  const OBSERVED_START = "OBSERVED_START";
  const OBSERVED_END = "OBSERVED_END";
  const DATE_UPLOADED_M = "DATE_UPLOADED_M";
  const UPLOADED_EXACT = "UPLOADED_EXACT";
  const UPLOADED_START = "UPLOADED_START";
  const UPLOADED_END = "UPLOADED_END";
  const PHOTO_LICENSING = "PHOTO_LICENSING";
  const CONFIRMATION = "CONFIRMATION";
  const [openSheet, setOpenSheet] = useState( NONE );
  const [showTaxonSearchModal, setShowTaxonSearchModal] = useState( false );
  const [showLocationSearchModal, setShowLocationSearchModal] = useState( false );
  const [showUserSearchModal, setShowUserSearchModal] = useState( false );
  const [showProjectSearchModal, setShowProjectSearchModal] = useState( false );

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

  const sortByValues = {
    [SORT_BY.DATE_UPLOADED_NEWEST]: {
      label: t( "Date-uploaded" ),
      text: t( "Newest-to-oldest" ),
      value: SORT_BY.DATE_UPLOADED_NEWEST
    },
    [SORT_BY.DATE_UPLOADED_OLDEST]: {
      label: t( "Date-uploaded" ),
      text: t( "Oldest-to-newest" ),
      value: SORT_BY.DATE_UPLOADED_OLDEST
    },
    [SORT_BY.DATE_OBSERVED_NEWEST]: {
      label: t( "Date-observed" ),
      text: t( "Newest-to-oldest" ),
      value: SORT_BY.DATE_OBSERVED_NEWEST
    },
    [SORT_BY.DATE_OBSERVED_OLDEST]: {
      label: t( "Date-observed" ),
      text: t( "Oldest-to-newest" ),
      value: SORT_BY.DATE_OBSERVED_OLDEST
    },
    [SORT_BY.MOST_FAVED]: {
      label: t( "Most-faved" ),
      value: SORT_BY.MOST_FAVED
    }
  };

  const taxonomicRankValues = {
    [TAXONOMIC_RANK.none]: {
      label: t( "NONE" ),
      value: TAXONOMIC_RANK.none
    },
    [TAXONOMIC_RANK.kingdom]: {
      label: t( "Ranks-KINGDOM" ),
      value: TAXONOMIC_RANK.kingdom
    },
    [TAXONOMIC_RANK.subkingdom]: {
      label: t( "Ranks-SUBKINGDOM" ),
      value: TAXONOMIC_RANK.subkingdom
    },
    [TAXONOMIC_RANK.phylum]: {
      label: t( "Ranks-PHYLUM" ),
      value: TAXONOMIC_RANK.phylum
    },
    [TAXONOMIC_RANK.subphylum]: {
      label: t( "Ranks-SUBPHYLUM" ),
      value: TAXONOMIC_RANK.subphylum
    },
    [TAXONOMIC_RANK.superclass]: {
      label: t( "Ranks-SUPERCLASS" ),
      value: TAXONOMIC_RANK.superclass
    },
    [TAXONOMIC_RANK.class]: {
      label: t( "Ranks-CLASS" ),
      value: TAXONOMIC_RANK.class
    },
    [TAXONOMIC_RANK.subclass]: {
      label: t( "Ranks-SUBCLASS" ),
      value: TAXONOMIC_RANK.subclass
    },
    [TAXONOMIC_RANK.infraclass]: {
      label: t( "Ranks-INFRACLASS" ),
      value: TAXONOMIC_RANK.infraclass
    },
    [TAXONOMIC_RANK.subterclass]: {
      label: t( "Ranks-SUBTERCLASS" ),
      value: TAXONOMIC_RANK.subterclass
    },
    [TAXONOMIC_RANK.superorder]: {
      label: t( "Ranks-SUPERORDER" ),
      value: TAXONOMIC_RANK.superorder
    },
    [TAXONOMIC_RANK.order]: {
      label: t( "Ranks-ORDER" ),
      value: TAXONOMIC_RANK.order
    },
    [TAXONOMIC_RANK.suborder]: {
      label: t( "Ranks-SUBORDER" ),
      value: TAXONOMIC_RANK.suborder
    },
    [TAXONOMIC_RANK.infraorder]: {
      label: t( "Ranks-INFRAORDER" ),
      value: TAXONOMIC_RANK.infraorder
    },
    [TAXONOMIC_RANK.parvorder]: {
      label: t( "Ranks-PARVORDER" ),
      value: TAXONOMIC_RANK.parvorder
    },
    [TAXONOMIC_RANK.zoosection]: {
      label: t( "Ranks-ZOOSECTION" ),
      value: TAXONOMIC_RANK.zoosection
    },
    [TAXONOMIC_RANK.zoosubsection]: {
      label: t( "Ranks-ZOOSUBSECTION" ),
      value: TAXONOMIC_RANK.zoosubsection
    },
    [TAXONOMIC_RANK.superfamily]: {
      label: t( "Ranks-SUPERFAMILY" ),
      value: TAXONOMIC_RANK.superfamily
    },
    [TAXONOMIC_RANK.epifamily]: {
      label: t( "Ranks-EPIFAMILY" ),
      value: TAXONOMIC_RANK.epifamily
    },
    [TAXONOMIC_RANK.family]: {
      label: t( "Ranks-FAMILY" ),
      value: TAXONOMIC_RANK.family
    },
    [TAXONOMIC_RANK.subfamily]: {
      label: t( "Ranks-SUBFAMILY" ),
      value: TAXONOMIC_RANK.subfamily
    },
    [TAXONOMIC_RANK.supertribe]: {
      label: t( "Ranks-SUPERTRIBE" ),
      value: TAXONOMIC_RANK.supertribe
    },
    [TAXONOMIC_RANK.tribe]: {
      label: t( "Ranks-TRIBE" ),
      value: TAXONOMIC_RANK.tribe
    },
    [TAXONOMIC_RANK.subtribe]: {
      label: t( "Ranks-SUBTRIBE" ),
      value: TAXONOMIC_RANK.subtribe
    },
    [TAXONOMIC_RANK.genus]: {
      label: t( "Ranks-GENUS" ),
      value: TAXONOMIC_RANK.genus
    },
    [TAXONOMIC_RANK.genushybrid]: {
      label: t( "Ranks-GENUSHYBRID" ),
      value: TAXONOMIC_RANK.genushybrid
    },
    [TAXONOMIC_RANK.subgenus]: {
      label: t( "Ranks-SUBGENUS" ),
      value: TAXONOMIC_RANK.subgenus
    },
    [TAXONOMIC_RANK.section]: {
      label: t( "Ranks-SECTION" ),
      value: TAXONOMIC_RANK.section
    },
    [TAXONOMIC_RANK.subsection]: {
      label: t( "Ranks-SUBSECTION" ),
      value: TAXONOMIC_RANK.subsection
    },
    [TAXONOMIC_RANK.complex]: {
      label: t( "Ranks-COMPLEX" ),
      value: TAXONOMIC_RANK.complex
    },
    [TAXONOMIC_RANK.species]: {
      label: t( "Ranks-SPECIES" ),
      value: TAXONOMIC_RANK.species
    },
    [TAXONOMIC_RANK.hybrid]: {
      label: t( "Ranks-HYBRID" ),
      value: TAXONOMIC_RANK.hybrid
    },
    [TAXONOMIC_RANK.subspecies]: {
      label: t( "Ranks-SUBSPECIES" ),
      value: TAXONOMIC_RANK.subspecies
    },
    [TAXONOMIC_RANK.variety]: {
      label: t( "Ranks-VARIETY" ),
      value: TAXONOMIC_RANK.variety
    },
    [TAXONOMIC_RANK.form]: {
      label: t( "Ranks-FORM" ),
      value: TAXONOMIC_RANK.form
    },
    [TAXONOMIC_RANK.infrahybrid]: {
      label: t( "Ranks-INFRAHYBRID" ),
      value: TAXONOMIC_RANK.infrahybrid
    }
  };

  const dateObservedValues = {
    [DATE_OBSERVED.ALL]: {
      label: t( "All" ),
      labelCaps: t( "ALL" ),
      value: DATE_OBSERVED.ALL
    },
    [DATE_OBSERVED.EXACT_DATE]: {
      label: t( "Exact-Date" ),
      labelCaps: t( "EXACT-DATE" ),
      text: t( "Filter-by-observed-on-date" ),
      value: DATE_OBSERVED.EXACT_DATE
    },
    [DATE_OBSERVED.DATE_RANGE]: {
      label: t( "Date-Range" ),
      labelCaps: t( "DATE-RANGE" ),
      text: t( "Filter-by-observed-between-dates" ),
      value: DATE_OBSERVED.DATE_RANGE
    },
    [DATE_OBSERVED.MONTHS]: {
      label: t( "Months" ),
      labelCaps: t( "MONTHS" ),
      text: t( "Filter-by-observed-during-months" ),
      value: DATE_OBSERVED.MONTHS
    }
  };

  const dateUploadedValues = {
    [DATE_UPLOADED.ALL]: {
      label: t( "All" ),
      labelCaps: t( "ALL" ),
      value: DATE_UPLOADED.ALL
    },
    [DATE_UPLOADED.EXACT_DATE]: {
      label: t( "Exact-Date" ),
      labelCaps: t( "EXACT-DATE" ),
      text: t( "Filter-by-uploaded-on-date" ),
      value: DATE_UPLOADED.EXACT_DATE
    },
    [DATE_UPLOADED.DATE_RANGE]: {
      label: t( "Date-Range" ),
      labelCaps: t( "DATE-RANGE" ),
      text: t( "Filter-by-uploaded-between-dates" ),
      value: DATE_UPLOADED.DATE_RANGE
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

  const establishmentValues = {
    [ESTABLISHMENT_MEAN.ANY]: {
      label: t( "Any" ),
      value: ESTABLISHMENT_MEAN.ANY
    },
    [ESTABLISHMENT_MEAN.INTRODUCED]: {
      label: t( "Introduced" ),
      value: ESTABLISHMENT_MEAN.INTRODUCED
    },
    [ESTABLISHMENT_MEAN.NATIVE]: {
      label: t( "Native" ),
      value: ESTABLISHMENT_MEAN.NATIVE
    },
    [ESTABLISHMENT_MEAN.ENDEMIC]: {
      label: t( "Endemic" ),
      value: ESTABLISHMENT_MEAN.ENDEMIC
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

  const photoLicenseValues = {
    [PHOTO_LICENSE.ALL]: {
      label: t( "ALL" ),
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

  const updateDateObserved = ( {
    newDateObserved, newObservedOn, newD1, newD2, newMonths
  } ) => {
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
        observedOn: newObservedOn || today
      } );
    } else if ( newDateObserved === DATE_OBSERVED.DATE_RANGE ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_DATE_OBSERVED_RANGE,
        d1: newD1 || today,
        d2: newD2 || today
      } );
    } else if ( newDateObserved === DATE_OBSERVED.MONTHS ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_DATE_OBSERVED_MONTHS,
        months: newMonths || allMonths
      } );
    }
  };

  const updateObservedExact = date => {
    updateDateObserved( {
      newDateObserved: DATE_OBSERVED.EXACT_DATE,
      newObservedOn: date.toISOString().split( "T" )[0]
    } );
  };

  const updateObservedStart = date => {
    updateDateObserved( {
      newDateObserved: DATE_OBSERVED.DATE_RANGE,
      newD1: date.toISOString().split( "T" )[0],
      newD2: d2
    } );
  };

  const updateObservedEnd = date => {
    updateDateObserved( {
      newDateObserved: DATE_OBSERVED.DATE_RANGE,
      newD1: d1,
      newD2: date.toISOString().split( "T" )[0]
    } );
  };

  const updateObservedMonths = monthInteger => {
    const newMonths = months.includes( monthInteger )
      ? months.filter( m => m !== monthInteger )
      : [...months, monthInteger];
    updateDateObserved( {
      newDateObserved: DATE_OBSERVED.MONTHS,
      newMonths
    } );
  };

  const updateDateUploaded = ( { newDateUploaded, newD1, newD2 } ) => {
    const today = new Date().toISOString().split( "T" )[0];
    if ( newDateUploaded === DATE_UPLOADED.ALL ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_DATE_UPLOADED_ALL
      } );
    } else if ( newDateUploaded === DATE_UPLOADED.EXACT_DATE ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_DATE_UPLOADED_EXACT,
        createdOn: newD1 || today
      } );
    } else if ( newDateUploaded === DATE_UPLOADED.DATE_RANGE ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_DATE_UPLOADED_RANGE,
        createdD1: newD1 || today,
        createdD2: newD2 || today
      } );
    }
  };

  const updateUploadedStart = date => {
    updateDateUploaded( {
      newDateUploaded: DATE_UPLOADED.DATE_RANGE,
      newD1: date.toISOString().split( "T" )[0],
      newD2: createdD2
    } );
  };

  const updateUploadedEnd = date => {
    updateDateUploaded( {
      newDateUploaded: DATE_UPLOADED.DATE_RANGE,
      newD1: createdD1,
      newD2: date.toISOString().split( "T" )[0]
    } );
  };

  const theme = useTheme();

  const observedEndBeforeStart = d1 > d2;
  const uploadedEndBeforeStart = createdD1 > createdD2;
  const hasError = observedEndBeforeStart || uploadedEndBeforeStart;

  return (
    <ViewWrapper className="flex-1 bg-white" testID="filter-modal">
      {/* Header */}
      <View
        className="flex-row items-center p-5 justify-between bg-white"
        style={DROP_SHADOW}
      >
        <View className="flex-row items-center">
          <INatIconButton
            icon="close"
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
            accessibilityLabel={t( "Go-back" )}
          />
          <Heading1 className="ml-3">{t( "Explore-Filters" )}</Heading1>
          {numberOfFilters !== 0 && (
            <View className="ml-3">
              <NumberBadge number={numberOfFilters} />
            </View>
          )}
        </View>
        {isNotInitialState
          ? (
            <Body3
              accessibilityRole="button"
              onPress={async ( ) => {
                const exploreLocation = await defaultExploreLocation( );
                dispatch( { type: EXPLORE_ACTION.RESET, exploreLocation } );
              }}
            >
              {t( "Reset-verb" )}
            </Body3>
          )
          : (
            <Body3 className="opacity-50">{t( "Reset-verb" )}</Body3>
          )}
      </View>

      <ScrollView className="py-4">
        {/* Taxon Section */}
        <View className="mb-7">
          <Heading4 className="px-4 mb-5">{t( "TAXON" )}</Heading4>
          <View className="px-4 mb-5">
            {( taxon || ( iconicTaxonNames || [] ).indexOf( "unknown" ) >= 0 )
              ? (
                <Pressable
                  className="flex-row justify-between items-center"
                  accessibilityRole="button"
                  accessibilityLabel={t( "Change-taxon" )}
                  onPress={() => {
                    setShowTaxonSearchModal( true );
                  }}
                >
                  <DisplayTaxon taxon={taxon || "unknown"} />
                  <INatIcon name="edit" size={22} />
                </Pressable>
              )
              : (
                <Button
                  text={t( "SEARCH-FOR-A-TAXON" )}
                  onPress={() => {
                    setShowTaxonSearchModal( true );
                  }}
                  accessibilityLabel={t( "Search" )}
                />
              )}
          </View>
          <IconicTaxonChooser
            before
            chosen={iconicTaxonNames || [taxon?.name?.toLowerCase()]}
            onTaxonChosen={( taxonName: string ) => {
              if ( taxonName === "unknown" ) {
                if ( ( iconicTaxonNames || [] ).indexOf( taxonName ) >= 0 ) {
                  updateTaxon( null );
                } else {
                  filterByIconicTaxonUnknown();
                }
              } else if ( taxon?.name?.toLowerCase() === taxonName ) {
                updateTaxon( null );
              } else {
                const selectedTaxon = realm
                  ?.objects( "Taxon" )
                  .filtered( "name CONTAINS[c] $0", taxonName );
                const iconicTaxon = selectedTaxon.length > 0
                  ? selectedTaxon[0]
                  : null;
                updateTaxon( iconicTaxon );
              }
            }}
          />
        </View>

        {/*
          The iconic taxon chooser above should fill all width so we add padding here
        */}
        <View className="px-4">
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
                        setShowLocationSearchModal( true );
                      }}
                      accessibilityLabel={t( "Edit" )}
                    />
                  </View>
                )
                : (
                  <Button
                    text={t( "SEARCH-FOR-A-LOCATION" )}
                    onPress={() => {
                      setShowLocationSearchModal( true );
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
                      setShowUserSearchModal( true );
                    }}
                  >
                    <UserListItem
                      item={{ user }}
                      countText={t( "X-Observations", { count: user.observations_count } )}
                    />
                    <INatIcon name="edit" size={22} />
                  </Pressable>
                )
                : (
                  <Button
                    text={t( "FILTER-BY-A-USER" )}
                    onPress={() => {
                      setShowUserSearchModal( true );
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
                      setShowProjectSearchModal( true );
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
                      setShowProjectSearchModal( true );
                    }}
                    accessibilityLabel={t( "Filter" )}
                  />
                )}
            </View>
          </View>

          {/* Taxonomic Ranks section */}
          <View className="mb-7">
            <Heading4 className="mb-5">{t( "TAXONOMIC-RANKS" )}</Heading4>
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
          </View>

          {/* Date observed section */}
          <View className="mb-7">
            <Heading4 className="mb-5">{t( "DATE-OBSERVED" )}</Heading4>
            <Button
              text={dateObservedValues[dateObserved]?.labelCaps}
              className="shrink mb-7"
              dropdown
              onPress={() => {
                setOpenSheet( DATE_OBSERVED_M );
              }}
              accessibilityLabel={t( "Date-observed" )}
            />
            {dateObserved === DATE_OBSERVED.EXACT_DATE && (
              <View className="items-center">
                <Body1 className="mb-5">{observedOn}</Body1>
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
            {dateObserved === DATE_OBSERVED.DATE_RANGE && (
              <View className="items-center">
                <Body1
                  className={classNames(
                    "mb-5",
                    observedEndBeforeStart && "color-warningRed"
                  )}
                >
                  {d1}
                </Body1>
                <Button
                  level="primary"
                  text={t( "CHANGE-START-DATE" )}
                  className="w-full mb-7"
                  onPress={() => {
                    setOpenSheet( OBSERVED_START );
                  }}
                  accessibilityLabel={t( "Change-start-date" )}
                />
                <Body1 className="mb-5">{d2}</Body1>
                <Button
                  level="primary"
                  text={t( "CHANGE-END-DATE" )}
                  className="w-full mb-7"
                  onPress={() => {
                    setOpenSheet( OBSERVED_END );
                  }}
                  accessibilityLabel={t( "Change-end-date" )}
                />
                {observedEndBeforeStart && (
                  <View className="flex-row mb-5">
                    <INatIcon
                      name="triangle-exclamation"
                      size={19}
                      color={theme.colors.error}
                    />
                    <List2 className="ml-3">
                      {t( "Start-must-be-before-end" )}
                    </List2>
                  </View>
                )}
                <DateTimePicker
                  isDateTimePickerVisible={openSheet === OBSERVED_START}
                  toggleDateTimePicker={() => setOpenSheet( NONE )}
                  onDatePicked={date => updateObservedStart( date )}
                />
                <DateTimePicker
                  isDateTimePickerVisible={openSheet === OBSERVED_END}
                  toggleDateTimePicker={() => setOpenSheet( NONE )}
                  onDatePicked={date => updateObservedEnd( date )}
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
          </View>

          {/* Date uploaded section */}
          <View className="mb-7">
            <Heading4 className="mb-5">{t( "DATE-UPLOADED" )}</Heading4>
            <Button
              text={dateUploadedValues[dateUploaded]?.labelCaps}
              className="shrink mb-7"
              dropdown
              onPress={() => {
                setOpenSheet( DATE_UPLOADED_M );
              }}
              accessibilityLabel={t( "Date-uploaded" )}
            />
            {dateUploaded === DATE_UPLOADED.EXACT_DATE && (
              <View className="items-center">
                <Body1 className="mb-5">{createdOn}</Body1>
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
                  onDatePicked={date => updateDateUploaded( {
                    newDateUploaded: DATE_UPLOADED.EXACT_DATE,
                    newD1: date.toISOString().split( "T" )[0]
                  } )}
                />
              </View>
            )}
            {dateUploaded === DATE_UPLOADED.DATE_RANGE && (
              <View className="items-center">
                <Body1
                  className={classNames(
                    "mb-5",
                    uploadedEndBeforeStart && "color-warningRed"
                  )}
                >
                  {createdD1}
                </Body1>
                <Button
                  level="primary"
                  text={t( "CHANGE-START-DATE" )}
                  className="w-full mb-7"
                  onPress={() => {
                    setOpenSheet( UPLOADED_START );
                  }}
                  accessibilityLabel={t( "Change-start-date" )}
                />
                <Body1 className="mb-5">{createdD2}</Body1>
                <Button
                  level="primary"
                  text={t( "CHANGE-END-DATE" )}
                  className="w-full mb-7"
                  onPress={() => {
                    setOpenSheet( UPLOADED_END );
                  }}
                  accessibilityLabel={t( "Change-end-date" )}
                />
                {uploadedEndBeforeStart && (
                  <View className="flex-row mb-5">
                    <INatIcon
                      name="triangle-exclamation"
                      size={19}
                      color={theme.colors.error}
                    />
                    <List2 className="ml-3">
                      {t( "Start-must-be-before-end" )}
                    </List2>
                  </View>
                )}
                <DateTimePicker
                  isDateTimePickerVisible={openSheet === UPLOADED_START}
                  toggleDateTimePicker={() => setOpenSheet( NONE )}
                  onDatePicked={date => updateUploadedStart( date )}
                />
                <DateTimePicker
                  isDateTimePickerVisible={openSheet === UPLOADED_END}
                  toggleDateTimePicker={() => setOpenSheet( NONE )}
                  onDatePicked={date => updateUploadedEnd( date )}
                />
              </View>
            )}
          </View>

          {/* Media section */}
          <View className="mb-3">
            <Heading4 className="mb-5">{t( "MEDIA" )}</Heading4>
            {Object.keys( mediaValues ).map( mediaKey => (
              <View key={mediaKey} className="mb-4">
                <RadioButtonRow
                  smallLabel
                  value={mediaValues[mediaKey]}
                  checked={mediaValues[mediaKey].value === media}
                  onPress={() => dispatch( {
                    type: EXPLORE_ACTION.SET_MEDIA,
                    media: mediaValues[mediaKey].value
                  } )}
                  label={mediaValues[mediaKey].label}
                />
              </View>
            ) )}
          </View>

          {/* Establishment Means section */}
          <View className="mb-3">
            <Heading4 className="mb-5">{t( "ESTABLISHMENT-MEANS" )}</Heading4>
            {Object.keys( establishmentValues ).map( establishmentKey => (
              <View key={establishmentKey} className="mb-4">
                <RadioButtonRow
                  smallLabel
                  value={establishmentValues[establishmentKey]}
                  checked={
                    establishmentValues[establishmentKey].value
                === establishmentMean
                  }
                  onPress={() => dispatch( {
                    type: EXPLORE_ACTION.SET_ESTABLISHMENT_MEAN,
                    establishmentMean:
                    establishmentValues[establishmentKey].value
                  } )}
                  label={establishmentValues[establishmentKey].label}
                />
              </View>
            ) )}
          </View>

          {/* Wild Status section */}
          <View className="mb-3">
            <Heading4 className="mb-5">{t( "WILD-STATUS" )}</Heading4>
            {Object.keys( wildValues ).map( wildKey => (
              <View key={wildKey} className="mb-4">
                <RadioButtonRow
                  smallLabel
                  value={wildValues[wildKey]}
                  checked={wildValues[wildKey].value === wildStatus}
                  onPress={() => dispatch( {
                    type: EXPLORE_ACTION.SET_WILD_STATUS,
                    wildStatus: wildValues[wildKey].value
                  } )}
                  label={wildValues[wildKey].label}
                />
              </View>
            ) )}
          </View>

          {/* Reviewed section */}
          {currentUser && (
            <View className="mb-3">
              <Heading4 className="mb-5">{t( "REVIEWED" )}</Heading4>
              {Object.keys( reviewedValues ).map( reviewedKey => (
                <View key={reviewedKey} className="mb-4">
                  <RadioButtonRow
                    key={reviewedKey}
                    smallLabel
                    value={reviewedValues[reviewedKey]}
                    checked={reviewedValues[reviewedKey].value === reviewedFilter}
                    onPress={() => dispatch( {
                      type: EXPLORE_ACTION.SET_REVIEWED,
                      reviewedFilter: reviewedValues[reviewedKey].value
                    } )}
                    label={reviewedValues[reviewedKey].label}
                  />
                </View>
              ) )}
            </View>
          )}

          {/* Photo licensing section */}
          <View className="mb-7">
            <Heading4 className="mb-5">{t( "PHOTO-LICENSING" )}</Heading4>
            <Button
              text={photoLicenseValues[photoLicense]?.label}
              className="shrink mb-7"
              dropdown
              onPress={() => {
                setOpenSheet( PHOTO_LICENSING );
              }}
              accessibilityLabel={t( "View-photo-licensing-info" )}
            />
          </View>
        </View>
      </ScrollView>
      {/* This view is to offset the absolute StickyToolbar below */}
      <View className="mb-10" />
      <StickyToolbar containerClass="z-9">
        <View className="flex-1 flex-row items-center">
          <Button
            disabled={!differsFromSnapshot || hasError}
            className="flex-1"
            level="focus"
            text={t( "APPLY-FILTERS" )}
            onPress={closeModal}
            accessibilityLabel={t( "Apply-filters" )}
            accessibilityState={{ disabled: !differsFromSnapshot || hasError }}
          />
        </View>
      </StickyToolbar>

      {/* BottomSheets */}
      {openSheet === SORT_BY_M && (
        <RadioButtonSheet
          headerText={t( "SORT-BY" )}
          confirm={newSortBy => {
            dispatch( {
              type: EXPLORE_ACTION.CHANGE_SORT_BY,
              sortBy: newSortBy
            } );
            setOpenSheet( NONE );
          }}
          handleClose={() => setOpenSheet( NONE )}
          radioValues={sortByValues}
          selectedValue={sortBy}
          insideModal
        />
      )}
      {openSheet === HRANK && (
        <PickerSheet
          headerText={t( "HIGHEST-RANK" )}
          confirm={newRank => {
            dispatch( {
              type: EXPLORE_ACTION.SET_HIGHEST_TAXONOMIC_RANK,
              hrank: newRank
            } );
            setOpenSheet( NONE );
          }}
          handleClose={() => setOpenSheet( NONE )}
          pickerValues={taxonomicRankValues}
          selectedValue={hrank}
          insideModal
        />
      )}
      {openSheet === LRANK && (
        <PickerSheet
          headerText={t( "LOWEST-RANK" )}
          confirm={newRank => {
            dispatch( {
              type: EXPLORE_ACTION.SET_LOWEST_TAXONOMIC_RANK,
              lrank: newRank
            } );
            setOpenSheet( NONE );
          }}
          handleClose={() => setOpenSheet( NONE )}
          pickerValues={taxonomicRankValues}
          selectedValue={lrank}
          insideModal
        />
      )}
      {openSheet === DATE_UPLOADED_M && (
        <RadioButtonSheet
          headerText={t( "DATE-UPLOADED" )}
          confirm={newDateUploaded => {
            updateDateUploaded( { newDateUploaded } );
            setOpenSheet( NONE );
          }}
          handleClose={() => setOpenSheet( NONE )}
          radioValues={dateUploadedValues}
          selectedValue={dateUploaded}
          insideModal
        />
      )}
      {openSheet === DATE_OBSERVED_M && (
        <RadioButtonSheet
          headerText={t( "DATE-OBSERVED" )}
          confirm={newDateObserved => {
            updateDateObserved( { newDateObserved } );
            setOpenSheet( NONE );
          }}
          handleClose={() => setOpenSheet( NONE )}
          radioValues={dateObservedValues}
          selectedValue={dateObserved}
          insideModal
        />
      )}
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
          radioValues={photoLicenseValues}
          selectedValue={photoLicense}
          insideModal
        />
      )}
      {openSheet === CONFIRMATION && (
        <WarningSheet
          handleClose={() => setOpenSheet( NONE )}
          confirm={() => {
            discardChanges();
            closeModal();
          }}
          headerText={t( "DISCARD-FILTER-CHANGES" )}
          text={t( "You-changed-filters-will-be-discarded" )}
          buttonText={t( "DISCARD-CHANGES" )}
          handleSecondButtonPress={() => setOpenSheet( NONE )}
          secondButtonText={t( "CANCEL" )}
          insideModal
        />
      )}
      <ExploreTaxonSearchModal
        closeModal={() => { setShowTaxonSearchModal( false ); }}
        hideInfoButton
        showModal={showTaxonSearchModal}
        updateTaxon={updateTaxon}
      />
      <ExploreLocationSearchModal
        showModal={showLocationSearchModal}
        closeModal={() => { setShowLocationSearchModal( false ); }}
        updateLocation={updateLocation}
      />
      <ExploreUserSearchModal
        showModal={showUserSearchModal}
        closeModal={() => { setShowUserSearchModal( false ); }}
        updateUser={updateUser}
      />
      <ExploreProjectSearchModal
        showModal={showProjectSearchModal}
        closeModal={() => { setShowProjectSearchModal( false ); }}
        updateProject={updateProject}
      />
    </ViewWrapper>
  );
};

export default FilterModal;
