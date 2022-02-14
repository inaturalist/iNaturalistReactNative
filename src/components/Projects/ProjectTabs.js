// @flow

import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { viewStyles } from "../../styles/projects/projects";
import useProjects from "./hooks/useProjects";
import ProjectList from "./ProjectList";
import { useUserLocation } from "../../sharedHooks/useUserLocation";
import useMemberId from "./hooks/useMemberId";

const ProjectTabs = ( ): React.Node => {
  const memberId = useMemberId( );
  const userJoined = { member_id: memberId };
  const [apiParams, setApiParams] = React.useState( userJoined );

  const latLng = useUserLocation( );
  const projects = useProjects( apiParams );

  const fetchProjectsByLatLng = ( ) => {
    setApiParams( {
      lat: latLng.latitude,
      lng: latLng.longitude
    } );
  };

  const fetchFeaturedProjects = ( ) => setApiParams( { features: true } );
  const fetchUserJoinedProjects = ( ) => setApiParams( userJoined );

  return (
    <>
      <View style={viewStyles.buttonRow}>
        <Pressable
          onPress={fetchUserJoinedProjects}
        >
          <Text>joined projects</Text>
        </Pressable>
        <Pressable
          onPress={fetchProjectsByLatLng}
          testID="ProjectTabs.featured"
        >
          <Text>nearby projects</Text>
        </Pressable>
        <Pressable
          onPress={fetchFeaturedProjects}
        >
          <Text>featured projects</Text>
        </Pressable>
      </View>
      <ProjectList data={projects} />
    </>
  );
};

export default ProjectTabs;
