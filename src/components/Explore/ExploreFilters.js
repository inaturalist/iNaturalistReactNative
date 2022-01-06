// @flow

import React, { useState, useContext } from "react";
import { Text } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import type { Node } from "react";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { pickerSelectStyles } from "../../styles/explore/exploreFilters";
import { ExploreContext } from "../../providers/contexts";
import DropdownPicker from "./DropdownPicker";

const ExploreFilters = ( ): Node => {
  const [project, setProject] = useState( "" );
  const [user, setUser] = useState( "" );
  const { exploreFilters, setExploreFilters } = useContext( ExploreContext );

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

  return (
    <ViewWithFooter>
      <Text>FILTER BY</Text>
      <Text>user</Text>
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
      <Text>quality grade</Text>
      <RNPickerSelect
        onValueChange={( itemValue ) =>
          setExploreFilters( {
            ...exploreFilters,
            quality_grade: itemValue
          } )
        }
        items={qualityGradeOptions}
        useNativeAndroidPickerStyle={false}
        style={pickerSelectStyles}
        value={exploreFilters.quality_grade}
      />
      <Text>status</Text>
      {/* TODO: not sure what goes here. maybe threatened, introduced, captive, wild? */}
      <Text>date</Text>
      <Text>months</Text>
      {/* TODO: make months accept multiple values */}
      <RNPickerSelect
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
      />
      <Text>sort by</Text>
      <RNPickerSelect
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
      />
    </ViewWithFooter>
  );
};

export default ExploreFilters;
