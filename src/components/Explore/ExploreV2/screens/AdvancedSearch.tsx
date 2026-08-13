import { useNavigation } from "@react-navigation/native";
import type { ApiPlace, ApiProjectSummary, ApiUser } from "api/types";
import { OBSERVATIONS_TAB } from "appConstants/tabs";
import DateFilterSection
  from "components/Explore/ExploreV2/components/DateFilterSection";
import RadioGroupSection
  from "components/Explore/ExploreV2/components/RadioGroupSection";
import SelectedFilterRow
  from "components/Explore/ExploreV2/components/SelectedFilterRow";
import {
  getDateObservedValues,
  getDateUploadedValues,
  getEstablishmentValues,
  getMediaValues,
  getMonthValues,
  getPhotoLicenseValues,
  getReviewedValues,
  getSortByValues,
  getTaxonomicRankValues,
  getWildValues,
} from "components/Explore/ExploreV2/helpers/advancedSearchOptions";
import type { SubjectTaxon }
  from "components/Explore/ExploreV2/helpers/advancedSearchReducer";
import { advancedSearchReducer, draftFromV2State }
  from "components/Explore/ExploreV2/helpers/advancedSearchReducer";
import ExploreLocationSearchModal from "components/Explore/Modals/ExploreLocationSearchModal";
import ExploreProjectSearchModal from "components/Explore/Modals/ExploreProjectSearchModal";
import ExploreTaxonSearchModal from "components/Explore/Modals/ExploreTaxonSearchModal";
import ExploreUserSearchModal from "components/Explore/Modals/ExploreUserSearchModal";
import type { ExploreSearchUser }
  from "components/Explore/SearchScreens/ExploreUserSearch";
import ProjectListItem from "components/ProjectList/ProjectListItem";
import {
  Body2,
  Body3,
  Button,
  ButtonBar,
  Checkbox,
  DisplayTaxon,
  Heading4,
  IconicTaxonChooser,
  INatIcon,
  PickerSheet,
  RadioButtonSheet,
} from "components/SharedComponents";
import SearchHeader from "components/SharedComponents/SearchHeader";
import { TopAndBottomInsetViewWrapper } from "components/SharedComponents/ViewWrapper";
import { ScrollView, View } from "components/styledComponents";
import UserListItem from "components/UserList/UserListItem";
import isEqual from "lodash/isEqual";
import type { ExploreStackScreenProps } from "navigation/types";
import { RealmContext } from "providers/contexts";
import {
  DATE_OBSERVED,
  DATE_UPLOADED,
} from "providers/ExploreContext";
import type { ExploreV2Subject } from "providers/ExploreV2Context";
import {
  EXPLORE_V2_ACTION,
  EXPLORE_V2_PLACE_MODE,
  useExploreV2,
} from "providers/ExploreV2Context";
import React, { useMemo, useReducer, useState } from "react";
import Taxon from "realmModels/Taxon";
import { formatObsFieldDate } from "sharedHelpers/dateAndTime";
import { useCurrentUser, useTranslation } from "sharedHooks";

const { useRealm } = RealmContext;

type SheetName = "sortBy" | "hrank" | "lrank" | "photoLicense";

type PickerKind = "taxon" | "user" | "project" | "location";

const AdvancedSearch = ( ) => {
  const navigation
    = useNavigation<ExploreStackScreenProps<"AdvancedSearch">["navigation"]>();
  const { t } = useTranslation();
  const realm = useRealm();
  const currentUser = useCurrentUser();

  const { state: v2State, dispatch: dispatchV2 } = useExploreV2();
  const [initialDraft] = useState( ( ) => draftFromV2State( v2State ) );
  const [draft, dispatch] = useReducer( advancedSearchReducer, initialDraft );
  const {
    subject, location, sortBy, filters,
  } = draft;

  const differsFromInitial = useMemo(
    ( ) => !isEqual( draft, initialDraft ),
    [draft, initialDraft],
  );

  // Which in-screen search picker (taxon/user/project/location) is open.
  const [openPicker, setOpenPicker] = useState<PickerKind | null>( null );
  const [openSheet, setOpenSheet] = useState<SheetName | null>( null );
  const closeSheet = ( ) => setOpenSheet( null );

  const updateTaxon = ( taxon: SubjectTaxon | null ) => dispatch( {
    type: "SET_TAXON",
    taxon,
  } );

  const filterByIconicTaxonUnknown = () => dispatch( {
    type: "FILTER_BY_ICONIC_UNKNOWN",
  } );

  const updateUser = ( selectedUser: ExploreSearchUser | null, exclude?: boolean ) => dispatch(
    exclude
      ? { type: "SET_EXCLUDE_USER", user: selectedUser }
      : { type: "SET_USER", user: selectedUser },
  );

  const updateProject = ( selectedProject: ApiProjectSummary | null ) => dispatch( {
    type: "SET_PROJECT",
    project: selectedProject,
  } );

  const updateLocation = ( newLocation: "worldwide" | ApiPlace ) => {
    if ( newLocation === "worldwide" ) {
      dispatch( { type: "SET_LOCATION_WORLDWIDE" } );
      return;
    }
    if ( !newLocation.id ) { return; }
    dispatch( {
      type: "SET_LOCATION_PLACE",
      place: { id: newLocation.id, display_name: newLocation.display_name },
    } );
  };

  const closePicker = ( ) => setOpenPicker( null );

  const handleSearch = () => {
    // "Unknown" is the one iconic-taxon choice ExploreV2 also models as a
    // subject, and only the subject path adds `identified: false` to the query.
    // Commit it as a subject so the results match the same choice made in
    // universal search, and so the results header names it.
    const subjectToCommit: ExploreV2Subject | null = subject
      ?? ( ( filters.iconic_taxa || [] ).includes( "unknown" )
        ? { type: "unknown" }
        : null );
    dispatchV2(
      subjectToCommit
        ? { type: EXPLORE_V2_ACTION.SET_SUBJECT, subject: subjectToCommit }
        : { type: EXPLORE_V2_ACTION.CLEAR_SUBJECT },
    );
    switch ( location.placeMode ) {
      case EXPLORE_V2_PLACE_MODE.PLACE:
        dispatchV2( { type: EXPLORE_V2_ACTION.SET_LOCATION_PLACE, place: location.place } );
        break;
      case EXPLORE_V2_PLACE_MODE.WORLDWIDE:
        dispatchV2( { type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE } );
        break;
      case EXPLORE_V2_PLACE_MODE.MAP_AREA:
        dispatchV2( {
          type: EXPLORE_V2_ACTION.SET_LOCATION_MAP_AREA,
          bounds: location.bounds,
        } );
        break;
      case EXPLORE_V2_PLACE_MODE.NEARBY:
        dispatchV2( { type: EXPLORE_V2_ACTION.SET_LOCATION_NEARBY } );
        break;
      default: {
        // Exhaustiveness check: ts fails if a new placeMode is added without a case.
        const _exhaustive: never = location;
        break;
      }
    }
    dispatchV2( { type: EXPLORE_V2_ACTION.SET_SORT, sortBy } );
    dispatchV2( { type: EXPLORE_V2_ACTION.SET_FILTERS, filters } );
    dispatchV2( { type: EXPLORE_V2_ACTION.SET_ACTIVE_TAB, tab: OBSERVATIONS_TAB } );
    navigation.popTo( "ExploreResults" );
  };

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
    excludeUser,
    hrank,
    iconic_taxa: iconicTaxonNames,
    lrank,
    media,
    months,
    needsID,
    observed_on: observedOn,
    photoLicense,
    project,
    researchGrade,
    reviewedFilter,
    user,
    wildStatus,
  } = filters;

  const taxon = subject?.type === "taxon"
    ? subject.taxon
    : null;

  const subjectUser: ApiUser | null = subject?.type === "user"
    ? subject.user
    : null;
  const displayUser = user || excludeUser || subjectUser;
  const subjectProject: ApiProjectSummary | null = subject?.type === "project"
    ? subject.project
    : null;
  const displayProject = project || subjectProject;
  const displayUserCountText = displayUser?.observations_count === undefined
    ? ""
    : t( "X-Observations", { count: displayUser.observations_count } );

  const locationText = () => {
    switch ( location.placeMode ) {
      case EXPLORE_V2_PLACE_MODE.WORLDWIDE:
        return t( "Worldwide" );
      case EXPLORE_V2_PLACE_MODE.PLACE:
        return location.place.display_name ?? "";
      case EXPLORE_V2_PLACE_MODE.MAP_AREA:
        return t( "Map-Area" );
      case EXPLORE_V2_PLACE_MODE.NEARBY:
        return t( "Nearby" );
      default: {
        // Exhaustiveness check: ts fails if a new placeMode is added without a case.
        const _exhaustive: never = location;
        return _exhaustive;
      }
    }
  };

  const sortByValues = getSortByValues( t );
  const taxonomicRankValues = getTaxonomicRankValues( t );
  const dateObservedValues = getDateObservedValues( t );
  const dateUploadedValues = getDateUploadedValues( t );
  const monthValues = getMonthValues( t );
  const photoLicenseValues = getPhotoLicenseValues( t );

  const updateDateObserved = ( {
    newDateObserved, newObservedOn, newD1, newD2, newMonths,
  } ) => {
    const today = formatObsFieldDate( new Date( ) );
    const allMonths = new Array( 12 ).fill( 0 ).map( ( _, i ) => i + 1 );

    if ( newDateObserved === DATE_OBSERVED.ALL ) {
      dispatch( {
        type: "SET_DATE_OBSERVED_ALL",
      } );
    } else if ( newDateObserved === DATE_OBSERVED.EXACT_DATE ) {
      dispatch( {
        type: "SET_DATE_OBSERVED_EXACT",
        observedOn: newObservedOn || today,
      } );
    } else if ( newDateObserved === DATE_OBSERVED.DATE_RANGE ) {
      dispatch( {
        type: "SET_DATE_OBSERVED_RANGE",
        d1: newD1 || today,
        d2: newD2 || today,
      } );
    } else if ( newDateObserved === DATE_OBSERVED.MONTHS ) {
      dispatch( {
        type: "SET_DATE_OBSERVED_MONTHS",
        months: newMonths || allMonths,
      } );
    }
  };

  const updateObservedMonths = monthInteger => {
    const currentMonths = months || [];
    const newMonths = currentMonths.includes( monthInteger )
      ? currentMonths.filter( m => m !== monthInteger )
      : [...currentMonths, monthInteger];
    updateDateObserved( {
      newDateObserved: DATE_OBSERVED.MONTHS,
      newMonths,
    } );
  };

  const updateDateUploaded = ( { newDateUploaded, newD1, newD2 } ) => {
    const today = formatObsFieldDate( new Date( ) );
    if ( newDateUploaded === DATE_UPLOADED.ALL ) {
      dispatch( {
        type: "SET_DATE_UPLOADED_ALL",
      } );
    } else if ( newDateUploaded === DATE_UPLOADED.EXACT_DATE ) {
      dispatch( {
        type: "SET_DATE_UPLOADED_EXACT",
        createdOn: newD1 || today,
      } );
    } else if ( newDateUploaded === DATE_UPLOADED.DATE_RANGE ) {
      dispatch( {
        type: "SET_DATE_UPLOADED_RANGE",
        createdD1: newD1 || today,
        createdD2: newD2 || today,
      } );
    }
  };

  const observedEndBeforeStart = d1 > d2;
  const uploadedEndBeforeStart = createdD1 > createdD2;
  // MONTHS mode with nothing checked emits no `month` param, which would
  // silently run an unfiltered search; block Search until a month is selected.
  const noMonthsSelected = dateObserved === DATE_OBSERVED.MONTHS
    && ( months || [] ).length === 0;
  const hasError = observedEndBeforeStart || uploadedEndBeforeStart || noMonthsSelected;

  return (
    <TopAndBottomInsetViewWrapper testID="AdvancedSearch">
      <SearchHeader
        headerText={t( "ADVANCED-SEARCH" )}
        onClose={() => navigation.goBack()}
        onReset={() => dispatch( { type: "RESET" } )}
        testID="AdvancedSearch.back"
      />

      <ScrollView className="py-4">
        {/* Taxon Section */}
        <View className="mb-7">
          <Heading4 className="px-4 mb-5">{t( "TAXON" )}</Heading4>
          <View className="px-4 mb-5">
            {( taxon || ( iconicTaxonNames || [] ).indexOf( "unknown" ) >= 0 )
              ? (
                <SelectedFilterRow
                  accessibilityLabel={t( "Change-taxon" )}
                  onEdit={() => setOpenPicker( "taxon" )}
                  onRemove={() => updateTaxon( null )}
                  removeAccessibilityLabel={t( "Remove-taxon-filter" )}
                >
                  <DisplayTaxon
                    handlePress={() => setOpenPicker( "taxon" )}
                    taxon={taxon || "unknown"}
                  />
                </SelectedFilterRow>
              )
              : (
                <Button
                  text={t( "SEARCH-FOR-A-TAXON" )}
                  onPress={() => {
                    setOpenPicker( "taxon" );
                  }}
                  accessibilityLabel={t( "Search" )}
                />
              )}
          </View>
          <IconicTaxonChooser
            before
            chosen={iconicTaxonNames || ( taxon?.name
              ? [taxon.name.toLowerCase()]
              : [] )}
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
                  .filtered( "name ==[c] $0", taxonName );
                const iconicTaxon = selectedTaxon && selectedTaxon.length > 0
                  ? Taxon.mapRealmToPojo( selectedTaxon[0] )
                  : null;
                updateTaxon( iconicTaxon );
              }
            }}
          />
        </View>
        <View className="px-4 pb-4">
          {/* Location Section */}
          <View className="mb-7">
            <Heading4 className="mb-5">{t( "LOCATION" )}</Heading4>
            <View className="mb-5">
              <View>
                <View className="flex-row items-center mb-5">
                  <INatIcon name="location" size={15} />
                  <Body3 className="ml-4">{locationText()}</Body3>
                </View>
                <Button
                  text={t( "EDIT-LOCATION" )}
                  onPress={() => {
                    setOpenPicker( "location" );
                  }}
                  accessibilityLabel={t( "Edit" )}
                />
              </View>
            </View>
          </View>

          {/* Sort-By Section */}
          <View className="mb-7">
            <Heading4 className="mb-5">{t( "SORT-BY" )}</Heading4>
            <View className="mb-5">
              <Button
                text={sortByValues[sortBy]?.labelCaps}
                className="shrink"
                dropdown
                onPress={() => {
                  setOpenSheet( "sortBy" );
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
                text={t( "Research-Grade--quality-grade" )}
                isChecked={researchGrade}
                onPress={() => dispatch( { type: "TOGGLE_RESEARCH_GRADE" } )}
              />
              <View className="mb-4" />
              <Checkbox
                text={t( "Needs-ID--quality-grade" )}
                isChecked={needsID}
                onPress={() => dispatch( { type: "TOGGLE_NEEDS_ID" } )}
              />
              <View className="mb-4" />
              <Checkbox
                text={t( "Casual--quality-grade" )}
                isChecked={casual}
                onPress={() => dispatch( { type: "TOGGLE_CASUAL" } )}
              />
            </View>
          </View>

          {/* User Section */}
          <View className="mb-7">
            <Heading4 className="mb-5">
              {excludeUser
                ? t( "ALL-USERS-EXCEPT" )
                : t( "USER" )}
            </Heading4>
            <View className="mb-5">
              {displayUser
                ? (
                  <SelectedFilterRow
                    accessibilityLabel={t( "Change-user" )}
                    justify="justify-around"
                    onEdit={() => setOpenPicker( "user" )}
                    onRemove={() => updateUser( null )}
                    removeAccessibilityLabel={t( "Remove-user-filter" )}
                  >
                    <UserListItem
                      item={{ user: displayUser }}
                      countText={displayUserCountText}
                      pressable={false}
                    />
                  </SelectedFilterRow>
                )
                : (
                  <Button
                    text={t( "FILTER-BY-A-USER" )}
                    onPress={() => {
                      setOpenPicker( "user" );
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
              {displayProject
                ? (
                  <SelectedFilterRow
                    accessibilityLabel={t( "Change-project" )}
                    onEdit={() => setOpenPicker( "project" )}
                    onRemove={() => updateProject( null )}
                    removeAccessibilityLabel={t( "Remove-project-filter" )}
                  >
                    <ProjectListItem item={displayProject} />
                  </SelectedFilterRow>
                )
                : (
                  <Button
                    text={t( "FILTER-BY-A-PROJECT" )}
                    onPress={() => {
                      setOpenPicker( "project" );
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
                setOpenSheet( "hrank" );
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
                setOpenSheet( "lrank" );
              }}
              accessibilityLabel={t( "Lowest" )}
            />
          </View>

          {/* Date observed section */}
          <DateFilterSection
            headerText={t( "DATE-OBSERVED" )}
            accessibilityLabel={t( "Date-observed" )}
            modeValues={dateObservedValues}
            mode={dateObserved}
            onChangeMode={newDateObserved => updateDateObserved( {
              // Carry existing dates through the mode switch so flipping modes
              // (e.g. Exact -> Range -> Exact) doesn't reset them to today.
              newDateObserved,
              newObservedOn: observedOn,
              newD1: d1,
              newD2: d2,
              newMonths: months,
            } )}
            exactMode={DATE_OBSERVED.EXACT_DATE}
            exactDate={observedOn}
            onChangeExactDate={newObservedOn => updateDateObserved( {
              newDateObserved: DATE_OBSERVED.EXACT_DATE,
              newObservedOn,
            } )}
            rangeMode={DATE_OBSERVED.DATE_RANGE}
            rangeStart={d1}
            rangeEnd={d2}
            rangeEndBeforeStart={observedEndBeforeStart}
            onChangeRangeStart={newD1 => updateDateObserved( {
              newDateObserved: DATE_OBSERVED.DATE_RANGE,
              newD1,
              newD2: d2,
            } )}
            onChangeRangeEnd={newD2 => updateDateObserved( {
              newDateObserved: DATE_OBSERVED.DATE_RANGE,
              newD1: d1,
              newD2,
            } )}
          >
            {dateObserved === DATE_OBSERVED.MONTHS
            && Object.keys( monthValues ).map( monthKey => (
              <View key={monthKey} className="flex-row items-center mb-5">
                <Checkbox
                  text={monthValues[monthKey].label}
                  isChecked={( months || [] ).includes( monthValues[monthKey].value )}
                  onPress={() => updateObservedMonths( monthValues[monthKey].value )}
                />
              </View>
            ) )}
          </DateFilterSection>

          {/* Date uploaded section */}
          <DateFilterSection
            headerText={t( "DATE-UPLOADED" )}
            accessibilityLabel={t( "Date-uploaded" )}
            modeValues={dateUploadedValues}
            mode={dateUploaded}
            onChangeMode={newDateUploaded => updateDateUploaded( {
              // Carry existing dates through the mode switch so flipping modes
              // doesn't reset them to today
              newDateUploaded,
              newD1: newDateUploaded === DATE_UPLOADED.EXACT_DATE
                ? createdOn
                : createdD1,
              newD2: createdD2,
            } )}
            exactMode={DATE_UPLOADED.EXACT_DATE}
            exactDate={createdOn}
            onChangeExactDate={newD1 => updateDateUploaded( {
              newDateUploaded: DATE_UPLOADED.EXACT_DATE,
              newD1,
            } )}
            rangeMode={DATE_UPLOADED.DATE_RANGE}
            rangeStart={createdD1}
            rangeEnd={createdD2}
            rangeEndBeforeStart={uploadedEndBeforeStart}
            onChangeRangeStart={newD1 => updateDateUploaded( {
              newDateUploaded: DATE_UPLOADED.DATE_RANGE,
              newD1,
              newD2: createdD2,
            } )}
            onChangeRangeEnd={newD2 => updateDateUploaded( {
              newDateUploaded: DATE_UPLOADED.DATE_RANGE,
              newD1: createdD1,
              newD2,
            } )}
          />

          {/* Media section */}
          <RadioGroupSection
            headerText={t( "MEDIA" )}
            values={getMediaValues( t )}
            selectedValue={media}
            onChange={newMedia => dispatch( { type: "SET_MEDIA", media: newMedia } )}
          />

          {/* Establishment Means section */}
          <RadioGroupSection
            headerText={t( "ESTABLISHMENT-MEANS" )}
            values={getEstablishmentValues( t )}
            selectedValue={establishmentMean}
            onChange={newEstablishmentMean => dispatch( {
              type: "SET_ESTABLISHMENT_MEAN",
              establishmentMean: newEstablishmentMean,
            } )}
          />

          {/* Wild Status section */}
          <RadioGroupSection
            headerText={t( "WILD-STATUS" )}
            values={getWildValues( t )}
            selectedValue={wildStatus}
            onChange={newWildStatus => dispatch( {
              type: "SET_WILD_STATUS",
              wildStatus: newWildStatus,
            } )}
          />

          {/* Reviewed section */}
          {currentUser && (
            <RadioGroupSection
              headerText={t( "REVIEWED" )}
              values={getReviewedValues( t )}
              selectedValue={reviewedFilter}
              onChange={newReviewedFilter => dispatch( {
                type: "SET_REVIEWED",
                reviewedFilter: newReviewedFilter,
              } )}
            />
          )}

          {/* Photo licensing section */}
          <View>
            <Heading4 className="mb-5">{t( "PHOTO-LICENSING" )}</Heading4>
            <Button
              text={photoLicenseValues[photoLicense]?.label}
              className="shrink mb-7"
              dropdown
              onPress={() => {
                setOpenSheet( "photoLicense" );
              }}
              accessibilityLabel={t( "View-photo-licensing-info" )}
            />
          </View>
        </View>
      </ScrollView>
      <ButtonBar>
        <Button
          disabled={hasError}
          level={differsFromInitial
            ? "focus"
            : "primary"}
          text={t( "SEARCH" )}
          onPress={handleSearch}
          accessibilityLabel={t( "Search" )}
          accessibilityState={{ disabled: hasError }}
          testID="AdvancedSearch.searchButton"
        />
      </ButtonBar>

      {/* BottomSheets */}
      {openSheet === "sortBy" && (
        <RadioButtonSheet
          headerText={t( "SORT-BY" )}
          confirm={newSortBy => {
            dispatch( {
              type: "SET_SORT",
              sortBy: newSortBy,
            } );
            closeSheet();
          }}
          onPressClose={closeSheet}
          radioValues={sortByValues}
          selectedValue={sortBy}
          insideModal
        />
      )}
      {openSheet === "hrank" && (
        <PickerSheet
          headerText={t( "HIGHEST-RANK" )}
          confirm={newRank => {
            dispatch( {
              type: "SET_HRANK",
              hrank: newRank,
            } );
            closeSheet();
          }}
          onPressClose={closeSheet}
          pickerValues={taxonomicRankValues}
          selectedValue={hrank}
          insideModal
        />
      )}
      {openSheet === "lrank" && (
        <PickerSheet
          headerText={t( "LOWEST-RANK" )}
          confirm={newRank => {
            dispatch( {
              type: "SET_LRANK",
              lrank: newRank,
            } );
            closeSheet();
          }}
          onPressClose={closeSheet}
          pickerValues={taxonomicRankValues}
          selectedValue={lrank}
          insideModal
        />
      )}
      {openSheet === "photoLicense" && (
        <RadioButtonSheet
          headerText={t( "PHOTO-LICENSING" )}
          confirm={newLicense => {
            dispatch( {
              type: "SET_PHOTO_LICENSE",
              photoLicense: newLicense,
            } );
            closeSheet();
          }}
          onPressClose={closeSheet}
          radioValues={photoLicenseValues}
          selectedValue={photoLicense}
          insideModal
        />
      )}
      {openPicker === "taxon" && (
        <ExploreTaxonSearchModal
          showModal
          closeModal={closePicker}
          updateTaxon={realmTaxon => updateTaxon(
            realmTaxon
              ? Taxon.mapRealmToPojo( realmTaxon )
              : null,
          )}
        />
      )}
      {openPicker === "user" && (
        <ExploreUserSearchModal
          showModal
          closeModal={closePicker}
          updateUser={updateUser}
        />
      )}
      {openPicker === "project" && (
        <ExploreProjectSearchModal
          showModal
          closeModal={closePicker}
          updateProject={updateProject}
        />
      )}
      {openPicker === "location" && (
        <ExploreLocationSearchModal
          showModal
          closeModal={closePicker}
          onSelectNearby={() => dispatch( { type: "SET_LOCATION_NEARBY" } )}
          updateLocation={updateLocation}
        />
      )}
    </TopAndBottomInsetViewWrapper>
  );
};

export default AdvancedSearch;
