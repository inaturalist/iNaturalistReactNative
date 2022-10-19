// @flow

import { searchProjects } from "api/projects";
import { t } from "i18next";
import * as React from "react";
import { Pressable, Text, View } from "react-native";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useUserLocation from "sharedHooks/useUserLocation";
import { viewStyles } from "styles/projects/projects";

import ProjectList from "./ProjectList";

type Props = {
  memberId: number
}

const ProjectTabs = ( { memberId }: Props ): React.Node => {
  const userJoined = { member_id: memberId };
  const [apiParams, setApiParams] = React.useState( userJoined );

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
  const fetchUserJoinedProjects = ( ) => setApiParams( userJoined );

  return (
    <>
      <View style={viewStyles.buttonRow}>
        <Pressable
          onPress={fetchUserJoinedProjects}
        >
          <Text>{t( "Joined" )}</Text>
        </Pressable>
        <Pressable
          onPress={fetchFeaturedProjects}
        >
          <Text>{t( "Featured" )}</Text>
        </Pressable>
        <Pressable
          onPress={fetchProjectsByLatLng}
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
