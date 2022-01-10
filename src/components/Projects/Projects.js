// @flow

import * as React from "react";
import { FlatList, Pressable, Text, Image, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import InputField from "../SharedComponents/InputField";
import useRemoteSearchResults from "../../sharedHooks/useRemoteSearchResults";
import { imageStyles, viewStyles, textStyles } from "../../styles/projects/projects";
import { useUserLocation } from "../../sharedHooks/useUserLocation";
import useProjects from "./hooks/useProjects";

const Projects = ( ): React.Node => {
  const [q, setQ] = React.useState( "" );
  const [apiParams, setApiParams] = React.useState( { } );

  const navigation = useNavigation( );

  const projectSearchResults = useRemoteSearchResults( q, "projects" );

  const latLng = useUserLocation( );

  const projects = useProjects( apiParams );

  const renderProjectSearchResults = ( { item } ) => {
    const navToProjectDetails = ( ) => navigation.navigate( "ProjectDetails", { id: item.id } );
    return (
      <Pressable
        onPress={navToProjectDetails}
        style={viewStyles.row}
        testID={`ProjectSearch.${item.id}`}
      >
        <Image source={{ uri: item.icon }} style={imageStyles.projectIcon} testID={`ProjectSearch.${item.id}.photo`}/>
        <Text style={textStyles.projectName}>{item.title}</Text>
      </Pressable>
    );
  };

  const clearSearch = ( ) => setQ( "" );

  const renderProjectResults = ( { item } ) => {
    const navToProjectDetails = ( ) => navigation.navigate( "ProjectDetails", { id: item.id } );
    return (
      <Pressable
        onPress={navToProjectDetails}
        style={viewStyles.row}
        testID={`Projects.${item.id}`}
      >
        <Text style={textStyles.projectName}>{item.id}</Text>
        {/* <Image source={{ uri: item.icon }} style={imageStyles.projectIcon} testID={`Projects.${item.id}.photo`}/>
        <Text style={textStyles.projectName}>{item.title}</Text> */}
      </Pressable>
    );
  };

  const fetchProjectsByLatLng = ( ) => {
    setApiParams( {
      lat: latLng.latitude,
      lng: latLng.longitude
    } );
  };

  const fetchFeaturedProjects = ( ) => setApiParams( { features: true } );

  // TODO: change member_id to current user's id, not Amanda's id
  const fetchUserJoinedProjects = ( ) => setApiParams( { member_id: 1132118 } );

  return (
    <ViewWithFooter>
      <InputField
        handleTextChange={setQ}
        placeholder="search for projects"
        text={q}
        type="none"
      />

      {q !== "" ? (
        <>
          <Pressable
            onPress={clearSearch}
          >
            <Text>cancel search</Text>
          </Pressable>
          <FlatList
            data={projectSearchResults}
            renderItem={renderProjectSearchResults}
            testID="ProjectSearch.listView"
          />
        </>
      ) : (
        <>
          <View style={viewStyles.buttonRow}>
            <Pressable
              onPress={fetchUserJoinedProjects}
            >
              <Text>joined projects</Text>
            </Pressable>
            <Pressable
              onPress={fetchProjectsByLatLng}
            >
              <Text>nearby projects</Text>
            </Pressable>
            <Pressable
              onPress={fetchFeaturedProjects}
            >
              <Text>featured projects</Text>
            </Pressable>
          </View>
          <FlatList
            data={projects}
            renderItem={renderProjectResults}
            testID="Projects.listView"
          />
        </>
      )}
    </ViewWithFooter>
  );
};

export default Projects;
