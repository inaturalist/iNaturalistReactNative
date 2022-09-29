// @flow

import CheckBox from "@react-native-community/checkbox";
import InputField from "components/SharedComponents/InputField";
import ScrollNoFooter from "components/SharedComponents/ScrollNoFooter";
import TranslatedText from "components/SharedComponents/TranslatedText";
import { t } from "i18next";
import { ExploreContext } from "providers/contexts";
import RadioButtonRN from "radio-buttons-react-native";
import type { Node } from "react";
import React, { useContext, useState } from "react";
import { View } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { pickerSelectStyles, viewStyles } from "styles/explore/exploreFilters";

import DropdownPicker from "./DropdownPicker";
import ExploreFooter from "./ExploreFooter";
import ResetFiltersButton from "./ResetFiltersButton";
import TaxonLocationSearch from "./TaxonLocationSearch";

const ExploreFilters = ( ): Node => {
  const [project, setProject] = useState( "" );
  const [user, setUser] = useState( "" );
  const {
    exploreFilters,
    setExploreFilters,
    unappliedFilters,
    setUnappliedFilters
  } = useContext( ExploreContext );

  const setProjectId = getValue => {
    setUnappliedFilters( {
      ...unappliedFilters,
      project_id: getValue( )
    } );
  };

  const setUserId = getValue => {
    setUnappliedFilters( {
      ...unappliedFilters,
      user_id: getValue( )
    } );
  };

  const sortByRadioButtons = [{
    label: t( "Date-added-newest-to-oldest" ),
    type: "desc"
  }, {
    label: t( "Date-added-oldest-to-newest" ),
    type: "asc"
  }, {
    label: t( "Recently-observed" ),
    type: "observed_on"
  }, {
    label: t( "Most-faved" ),
    type: "votes"
  }];

  const reviewedRadioButtons = [{
    label: t( "All-observations" ),
    type: "all"
  }, {
    label: t( "Reviewed-only" ),
    type: "reviewed"
  }, {
    label: t( "Unreviewed-only" ),
    type: "unreviewed"
  }];

  const months = [
    { label: t( "Month-January" ), value: 1 },
    { label: t( "Month-February" ), value: 2 },
    { label: t( "Month-March" ), value: 3 },
    { label: t( "Month-April" ), value: 4 },
    { label: t( "Month-May" ), value: 5 },
    { label: t( "Month-June" ), value: 6 },
    { label: t( "Month-July" ), value: 7 },
    { label: t( "Month-August" ), value: 8 },
    { label: t( "Month-September" ), value: 9 },
    { label: t( "Month-October" ), value: 10 },
    { label: t( "Month-November" ), value: 11 },
    { label: t( "Month-December" ), value: 12 }
  ];

  const photoLicenses = [
    { label: t( "All" ), value: "all" },
    { label: "CC-BY", value: "cc-by" },
    { label: "CC-BY-NC", value: "cc-by-nc" },
    { label: "CC-BY-ND", value: "cc-by-nd" },
    { label: "CC-BY-SA", value: "cc-by-sa" },
    { label: "CC-BY-NC-ND", value: "cc-by-nc-nd" },
    { label: "CC-BY-NC-SA", value: "cc-by-nc-sa" },
    { label: "CC0", value: "cc0" }
  ];

  const ranks = [
    { label: t( "Ranks-stateofmatter" ), value: "stateofmatter" },
    { label: t( "Ranks-kingdom" ), value: "kingdom" },
    { label: t( "Ranks-subkingdom" ), value: "subkingdom" },
    { label: t( "Ranks-phylum" ), value: "phylum" },
    { label: t( "Ranks-subphylum" ), value: "subphylum" },
    { label: t( "Ranks-superclass" ), value: "superclass" },
    { label: t( "Ranks-class" ), value: "class" },
    { label: t( "Ranks-subclass" ), value: "subclass" },
    { label: t( "Ranks-infraclass" ), value: "infraclass" },
    { label: t( "Ranks-superorder" ), value: "superorder" },
    { label: t( "Ranks-order" ), value: "order" },
    { label: t( "Ranks-suborder" ), value: "suborder" },
    { label: t( "Ranks-infraorder" ), value: "infraorder" },
    { label: t( "Ranks-subterclass" ), value: "subterclass" },
    { label: t( "Ranks-parvorder" ), value: "parvorder" },
    { label: t( "Ranks-zoosection" ), value: "zoosection" },
    { label: t( "Ranks-zoosubsection" ), value: "zoosubsection" },
    { label: t( "Ranks-superfamily" ), value: "superfamily" },
    { label: t( "Ranks-epifamily" ), value: "epifamily" },
    { label: t( "Ranks-family" ), value: "family" },
    { label: t( "Ranks-subfamily" ), value: "subfamily" },
    { label: t( "Ranks-supertribe" ), value: "supertribe" },
    { label: t( "Ranks-tribe" ), value: "tribe" },
    { label: t( "Ranks-subtribe" ), value: "subtribe" },
    { label: t( "Ranks-genus" ), value: "genus" },
    { label: t( "Ranks-genushybrid" ), value: "genushybrid" },
    { label: t( "Ranks-subgenus" ), value: "subgenus" },
    { label: t( "Ranks-section" ), value: "section" },
    { label: t( "Ranks-subsection" ), value: "subsection" },
    { label: t( "Ranks-complex" ), value: "complex" },
    { label: t( "Ranks-species" ), value: "species" },
    { label: t( "Ranks-hybrid" ), value: "hybrid" },
    { label: t( "Ranks-subspecies" ), value: "subspecies" },
    { label: t( "Ranks-variety" ), value: "variety" },
    { label: t( "Ranks-form" ), value: "form" },
    { label: t( "Ranks-infrahybrid" ), value: "infrahybrid" }
  ];

  const projectId = unappliedFilters ? unappliedFilters.project_id : null;
  const userId = unappliedFilters ? unappliedFilters.user_id : null;

  const renderQualityGradeCheckbox = qualityGrade => {
    const filter = unappliedFilters.quality_grade;
    const hasFilter = filter.includes( qualityGrade );

    return (
      <CheckBox
        boxType="square"
        disabled={false}
        value={hasFilter}
        onValueChange={( ) => {
          if ( hasFilter ) {
            setUnappliedFilters( {
              ...unappliedFilters,
              quality_grade: filter.filter( e => e !== qualityGrade )
            } );
          } else {
            filter.push( qualityGrade );
            setUnappliedFilters( {
              ...unappliedFilters,
              quality_grade: filter
            } );
          }
        }}
        style={viewStyles.checkbox}
      />
    );
  };

  const renderMediaCheckbox = mediaType => {
    const { sounds, photos } = unappliedFilters;
    return (
      <CheckBox
        boxType="square"
        disabled={false}
        value={mediaType === "photos" ? photos : sounds}
        onValueChange={( ) => {
          if ( mediaType === "photos" ) {
            setUnappliedFilters( {
              ...unappliedFilters,
              photos: !unappliedFilters.photos
            } );
          } else {
            setUnappliedFilters( {
              ...unappliedFilters,
              sounds: !unappliedFilters.sounds
            } );
          }
        }}
        style={viewStyles.checkbox}
      />
    );
  };

  const renderStatusCheckbox = status => {
    const {
      native, captive, introduced, threatened
    } = unappliedFilters;

    let value;

    if ( status === "native" ) {
      value = native;
    } else if ( status === "captive" ) {
      value = captive;
    } else if ( status === "introduced" ) {
      value = introduced;
    } else {
      value = threatened;
    }

    return (
      <CheckBox
        boxType="square"
        disabled={false}
        value={value}
        onValueChange={( ) => {
          setUnappliedFilters( {
            ...unappliedFilters,
            // $FlowFixMe
            [status]: !unappliedFilters[status]
          } );
        }}
        style={viewStyles.checkbox}
      />
    );
  };

  const renderRankPicker = rank => (
    <RNPickerSelect
      onValueChange={itemValue => {
        setUnappliedFilters( {
          ...unappliedFilters,
          // $FlowFixMe
          [rank]: [itemValue]
        } );
      }}
      items={ranks}
      useNativeAndroidPickerStyle={false}
      style={pickerSelectStyles}
      value={unappliedFilters[rank].length > 0 ? unappliedFilters[rank][0] : null}
    />
  );

  const renderMonthsPicker = ( ) => {
    const firstMonth = unappliedFilters.months[0];
    const lastMonth = unappliedFilters.months[unappliedFilters.months.length - 1];

    const includesMonth = value => unappliedFilters.months.includes( value );

    const fillInMonths = itemValue => {
      months.forEach( ( { value } ) => {
        if ( value >= firstMonth && value <= itemValue && !includesMonth( value ) ) {
          unappliedFilters.months.push( value );
        } else if ( value > itemValue && includesMonth( value ) ) {
          const index = unappliedFilters.months.indexOf( value );
          unappliedFilters.months.splice( index );
        }
      } );
      setUnappliedFilters( { ...unappliedFilters } );
    };

    return (
      <>
        <RNPickerSelect
          onValueChange={itemValue => {
            unappliedFilters.months = [itemValue];
            setUnappliedFilters( { ...unappliedFilters } );
          }}
          items={months}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          value={firstMonth}
        />
        <RNPickerSelect
          onValueChange={itemValue => fillInMonths( itemValue )}
          items={months}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          value={lastMonth}
        />
      </>
    );
  };

  return (
    <>
      <ScrollNoFooter>
        <TaxonLocationSearch />
        <TranslatedText text="Sort-by" />
        <RadioButtonRN
          data={sortByRadioButtons}
          initial={1}
          boxStyle={viewStyles.radioButtonBox}
          selectedBtn={( { type } ) => {
            if ( type === "desc" || type === "asc" ) {
              setExploreFilters( {
                ...exploreFilters,
                order: type,
                order_by: "created_at"
              } );
            } else {
            // votes or observed_on only sort by most recent
              setExploreFilters( {
                ...exploreFilters,
                order: "desc",
                order_by: type
              } );
            }
          }}
        />
        <View style={viewStyles.filtersRow}>
          <TranslatedText text="Filters" />
          <ResetFiltersButton />
        </View>
        <TranslatedText text="Quality-Grade" />
        <View style={viewStyles.checkboxRow}>
          {renderQualityGradeCheckbox( "research" )}
          <TranslatedText text="Research-Grade" />
        </View>
        <View style={viewStyles.checkboxRow}>
          {renderQualityGradeCheckbox( "needs_id" )}
          <TranslatedText text="Needs-ID" />
        </View>
        <View style={viewStyles.checkboxRow}>
          {renderQualityGradeCheckbox( "casual" )}
          <TranslatedText text="Casual" />
        </View>
        <TranslatedText text="User" />
        <TranslatedText text="Search-for-a-user" />
        <DropdownPicker
          searchQuery={user}
          setSearchQuery={setUser}
          setValue={setUserId}
          sources="users"
          value={userId}
        />
        <TranslatedText text="Projects" />
        <TranslatedText text="Search-for-a-project" />
        <DropdownPicker
          searchQuery={project}
          setSearchQuery={setProject}
          setValue={setProjectId}
          sources="projects"
          value={projectId}
        />
        <TranslatedText text="Rank" />
        <TranslatedText text="Low" />
        {renderRankPicker( "lrank" )}
        <TranslatedText text="High" />
        {renderRankPicker( "hrank" )}
        <TranslatedText text="Date" />
        <TranslatedText text="Months" />
        {renderMonthsPicker( )}
        <TranslatedText text="Media" />
        <View style={viewStyles.checkboxRow}>
          {renderMediaCheckbox( "photos" )}
          <TranslatedText text="Has-Photos" />
        </View>
        <View style={viewStyles.checkboxRow}>
          {renderMediaCheckbox( "sounds" )}
          <TranslatedText text="Has-Sounds" />
        </View>
        <TranslatedText text="Status" />
        <View style={viewStyles.checkboxRow}>
          {renderStatusCheckbox( "introduced" )}
          <TranslatedText text="Introduced" />
        </View>
        <View style={viewStyles.checkboxRow}>
          {renderStatusCheckbox( "native" )}
          <TranslatedText text="Native" />
        </View>
        <View style={viewStyles.checkboxRow}>
          {renderStatusCheckbox( "threatened" )}
          <TranslatedText text="Threatened" />
        </View>
        <View style={viewStyles.checkboxRow}>
          {renderStatusCheckbox( "captive" )}
          <TranslatedText text="Captive-Cultivated" />
        </View>
        <TranslatedText text="Reviewed" />
        <RadioButtonRN
          data={reviewedRadioButtons}
          initial={1}
          boxStyle={viewStyles.radioButtonBox}
          selectedBtn={( { type } ) => {
            if ( type === "all" ) {
              delete unappliedFilters.reviewed;
              setUnappliedFilters( { ...unappliedFilters } );
            } else if ( type === "reviewed" ) {
              setUnappliedFilters( {
                ...unappliedFilters,
                reviewed: true
              } );
            } else {
              setUnappliedFilters( {
                ...unappliedFilters,
                reviewed: false
              } );
            }
          }}
        />
        <TranslatedText text="Photo-Licensing" />
        <RNPickerSelect
          onValueChange={itemValue => {
            setUnappliedFilters( {
              ...unappliedFilters,
              photo_license: itemValue === "all" ? [] : [itemValue]
            } );
          }}
          items={photoLicenses}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          value={
            unappliedFilters.photo_license.length > 0
              ? unappliedFilters.photo_license[0]
              : "all"
          }
        />
        <TranslatedText text="Description-Tags" />
        <InputField
          handleTextChange={q => {
            setUnappliedFilters( {
              ...unappliedFilters,
              q
            } );
          }}
          placeholder={t( "Search-for-description-tags-text" )}
          text={unappliedFilters.q}
          type="none"
        />
        <View style={viewStyles.bottomPadding} />
      </ScrollNoFooter>
      <ExploreFooter />
    </>
  );
};

export default ExploreFilters;
