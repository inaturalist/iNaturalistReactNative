// @flow

import React, { useState } from "react";
import { View, Text } from "react-native";
import type { Node } from "react";

import { textStyles } from "../../styles/obsDetails";
import Map from "../SharedComponents/Map";
import DropdownPicker from "../Explore/DropdownPicker";
import addToProject from "./helpers/addToProject";

type Props = {
  observation: Object
}

const DataTab = ( { observation }: Props ): Node => {
  const [project, setProject] = useState( "" );
  const [projectId, setProjectId] = useState( null );

  const application = observation.application && observation.application.name;
  const attribution = observation.taxon && observation.taxon.default_photo
    && observation.taxon.default_photo.attribution;
  console.log( attribution, "application obs" );

  const selectProjectId = ( getValue ) => {
    addToProject( getValue( ), observation.uuid );
    setProjectId( getValue( ) );
  };

  return (
    <View>
      <Text style={textStyles.dataTabText}>Notes</Text>
      <Text style={textStyles.dataTabText}>{observation.description || "no description"}</Text>
      <Map
        obsLatitude={observation.latitude}
        obsLongitude={observation.longitude}
        mapHeight={150}
      />
      {/* {console.log( observation, "obs" )} */}
      <Text style={textStyles.dataTabText}>{observation.placeGuess}</Text>
      <Text style={textStyles.dataTabText}>Date</Text>
      <Text style={textStyles.dataTabText}>{`date observed ${observation.timeObservedAt}`}</Text>
      <Text style={textStyles.dataTabText}>{`date uploaded ${observation.createdAt}`}</Text>
      <Text style={textStyles.dataTabText}>Projects</Text>
      {/* TODO: create a custom dropdown that doesn't use FlatList */}
      <DropdownPicker
        searchQuery={project}
        setSearchQuery={setProject}
        setValue={selectProjectId}
        sources="projects"
        value={projectId}
      />
      <Text style={textStyles.dataTabText}>Observation Fields & Annotations</Text>
      <Text style={textStyles.dataTabText}>Other Data</Text>
      {attribution && <Text style={textStyles.dataTabText}>{attribution}</Text>}
      {application && (
        <>
          <Text style={textStyles.dataTabText}>This observation was created using:</Text>
          <Text style={textStyles.dataTabText}>{application}</Text>
        </>
      )}
    </View>
  );
};

export default DataTab;
