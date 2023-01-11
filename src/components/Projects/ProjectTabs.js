// @flow

import { searchProjects } from "api/projects";
import { t } from "i18next";
import type { Node } from "react";
import React, { useCallback, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useUserLocation from "sharedHooks/useUserLocation";
import { viewStyles } from "styles/projects/projects";

import ProjectList from "./ProjectList";

const ProjectTabs = ( ): Node => {
  const currentUser = useCurrentUser( );
  const memberId = currentUser?.id;
  const [apiParams, setApiParams] = React.useState( { } );

  const latLng = useUserLocation( );

  const {
    data: projects
  } = useAuthenticatedQuery(
    ["searchProjects", apiParams],
    optsWithAuth => searchProjects( apiParams, optsWithAuth )
  );

  const fetchProjectsByLatLng = ( ) => {
    setApiParams( {
      lat: latLng.latitude,
      lng: latLng.longitude
    } );
  };

  const fetchFeaturedProjects = ( ) => setApiParams( { features: true } );
  const fetchUserJoinedProjects = useCallback( ( ) => setApiParams(
    { member_id: memberId }
  ), [memberId] );

  useEffect( ( ) => {
    if ( memberId ) {
      fetchUserJoinedProjects( );
    }
  }, [memberId, fetchUserJoinedProjects] );

  return (
    <>
      <View style={viewStyles.buttonRow}>
        <Pressable onPress={fetchUserJoinedProjects} accessibilityRole="tab">
          <Text>{t( "Joined" )}</Text>
        </Pressable>
        <Pressable onPress={fetchFeaturedProjects} accessibilityRole="tab">
          <Text>{t( "Featured" )}</Text>
        </Pressable>
        <Pressable
          onPress={fetchProjectsByLatLng}
          accessibilityRole="tab"
          testID="ProjectTabs.featured"
        >
          <Text>{t( "Nearby" )}</Text>
        </Pressable>
      </View>
      <ProjectList data={projects} />
    </>
  );
};

export default ProjectTabs;
