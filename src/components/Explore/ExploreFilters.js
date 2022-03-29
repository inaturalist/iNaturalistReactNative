// @flow

import React, { useState, useContext } from "react";
import { Text, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import type { Node } from "react";
import CheckBox from "@react-native-community/checkbox";

import { pickerSelectStyles, viewStyles } from "../../styles/explore/exploreFilters";
import { ExploreContext } from "../../providers/contexts";
import DropdownPicker from "./DropdownPicker";
import TaxonLocationSearch from "./TaxonLocationSearch";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import TranslatedText from "../SharedComponents/TranslatedText";

const ExploreFilters = ( ): Node => {
  const [project, setProject] = useState( "" );
  const [user, setUser] = useState( "" );
  const { exploreFilters, setExploreFilters } = useContext( ExploreContext );
  const [toggleCheckBox, setToggleCheckBox] = useState( false );

  const setProjectId = ( getValue ) => {
    setExploreFilters( {
      ...exploreFilters,
      project_id: getValue( )
    } );
  };

  const setUserId = ( getValue ) => {
    setExploreFilters( {
      ...exploreFilters,
      user_id: getValue( )
    } );
  };

  const months = [
    { label: "jan", value: 1 },
    { label: "feb", value: 2 },
    { label: "mar", value: 3 },
    { label: "apr", value: 4 },
    { label: "may", value: 5 },
    { label: "jun", value: 6 },
    { label: "jul", value: 7 },
    { label: "aug", value: 8 },
    { label: "sept", value: 9 },
    { label: "oct", value: 10 },
    { label: "nov", value: 11 },
    { label: "dec", value: 12 }
  ];

  const qualityGradeOptions = [
    { label: "research", value: "research" },
    { label: "needs id", value: "needs_id" }
  ];

  const sortOptions = [
    { label: "id", value: "observations.id" },
    { label: "observed on", value: "observed_on" },
    { label: "faves", value: "votes" }
  ];

  const projectId = exploreFilters ? exploreFilters.project_id : null;
  const userId = exploreFilters ? exploreFilters.user_id : null;

  const renderQualityGradeCheckbox = ( qualityGrade ) => {
    const filter = exploreFilters.quality_grade;
    const hasFilter = filter.includes( qualityGrade );

    return (
      <CheckBox
        boxType="square"
        disabled={false}
        value={hasFilter}
        onValueChange={( ) => {
          if ( hasFilter ) {
            setExploreFilters( {
              ...exploreFilters,
              quality_grade: filter.filter( e => e !== qualityGrade )
            } );
          } else {
            filter.push( qualityGrade );
            setExploreFilters( {
              ...exploreFilters,
              quality_grade: filter
            } );
          }
        }}
        style={viewStyles.checkbox}
      />
    );
  };

  const renderMediaCheckbox = ( mediaType ) => {
    const { sounds, photos } = exploreFilters;
    return (
      <CheckBox
        boxType="square"
        disabled={false}
        value={mediaType === "photos" ? photos : sounds}
        onValueChange={( ) => {
          if ( mediaType === "photos" ) {
            setExploreFilters( {
              ...exploreFilters,
              photos: !exploreFilters.photos
            } );
          } else {
            setExploreFilters( {
              ...exploreFilters,
              sounds: !exploreFilters.sounds
            } );
          }
        }}
        style={viewStyles.checkbox}
      />
    );
  };

  const renderStatusCheckbox = ( status ) => {
    const { native, captive, introduced, threatened } = exploreFilters;

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
          setExploreFilters( {
            ...exploreFilters,
            // $FlowFixMe
            [status]: !exploreFilters[status]
          } );
        }}
        style={viewStyles.checkbox}
      />
    );
  };

  return (
    <ViewNoFooter>
      <TaxonLocationSearch />
      <TranslatedText text="Sort-by" />
      {/* <RNPickerSelect
        onValueChange={( itemValue ) =>
          setExploreFilters( {
            ...exploreFilters,
            sort_by: itemValue
          } )
        }
        items={sortOptions}
        useNativeAndroidPickerStyle={false}
        style={pickerSelectStyles}
        value={exploreFilters.sort_by}
      /> */}
      {console.log( exploreFilters, "explore filter qg" )}
      <TranslatedText text="Filters" />
      <TranslatedText text="Reset" />
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
      <TranslatedText text="Projects" />
      <TranslatedText text="Search-for-a-project" />
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
      {/* <Text>user</Text>
      <DropdownPicker
        searchQuery={user}
        setSearchQuery={setUser}
        setValue={setUserId}
        sources="users"
        value={userId}
      />
      <Text>project</Text>
      <DropdownPicker
        searchQuery={project}
        setSearchQuery={setProject}
        setValue={setProjectId}
        sources="projects"
        value={projectId}
      />
      {/* <Text>date</Text>
      <Text>months</Text> */}
      {/* TODO: make months accept multiple values */}
      {/* <RNPickerSelect
        onValueChange={( itemValue ) =>
          setExploreFilters( {
            ...exploreFilters,
            month: itemValue
          } )
        }
        items={months}
        useNativeAndroidPickerStyle={false}
        style={pickerSelectStyles}
        value={exploreFilters.month}
      /> */}
    </ViewNoFooter>
  );
};

export default ExploreFilters;
