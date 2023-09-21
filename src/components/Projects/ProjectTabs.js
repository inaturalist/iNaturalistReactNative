// @flow

import { searchProjects } from "api/projects";
import { Tabs } from "components/SharedComponents";
import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import {
  useAuthenticatedQuery,
  useCurrentUser,
  useTranslation,
  useUserLocation
} from "sharedHooks";

import ProjectList from "./ProjectList";

const JOINED_TAB_ID = "JOINED";
const FEATURED_TAB_ID = "FEATURED";
const NEARBY_TAB_ID = "NEARBY";

const ProjectTabs = ( ): Node => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const memberId = currentUser?.id;
  const [apiParams, setApiParams] = useState( { } );
  const [currentTabId, setCurrentTabId] = useState( JOINED_TAB_ID );
  const { latLng, isLoading: isLoadingLocation } = useUserLocation( { skipPlaceGuess: true } );

  const {
    data: projects,
    isLoading
  } = useAuthenticatedQuery(
    ["searchProjects", apiParams],
    optsWithAuth => searchProjects( apiParams, optsWithAuth )
  );

  useEffect( ( ) => {
    if ( memberId && currentTabId === JOINED_TAB_ID ) {
      setApiParams( { member_id: memberId } );
    } else if ( currentTabId === FEATURED_TAB_ID ) {
      setApiParams( { features: true } );
    } else if ( currentTabId === NEARBY_TAB_ID && latLng ) {
      setApiParams( {
        lat: latLng.latitude,
        lng: latLng.longitude
      } );
    }
  }, [
    memberId,
    currentTabId,
    latLng
  ] );

  const tabs = [
    {
      id: JOINED_TAB_ID,
      text: t( "Joined" ),
      onPress: () => {
        setCurrentTabId( JOINED_TAB_ID );
      }
    },
    {
      id: FEATURED_TAB_ID,
      text: t( "Featured" ),
      onPress: () => {
        setCurrentTabId( FEATURED_TAB_ID );
      }
    },
    {
      id: NEARBY_TAB_ID,
      text: t( "Nearby" ),
      onPress: () => {
        setCurrentTabId( NEARBY_TAB_ID );
      }
    }
  ];

  const loading = isLoading || ( currentTabId === NEARBY_TAB_ID && isLoadingLocation );
  /* eslint-disable i18next/no-literal-string */
  return (
    <>
      <Tabs tabs={tabs} activeId={currentTabId} />
      { loading
        ? <Text>Loading</Text>
        : <ProjectList data={projects} />}
      <LocationPermissionGate
        permissionNeeded={currentTabId === NEARBY_TAB_ID}
        withoutNavigation
      />
    </>
  );
};

export default ProjectTabs;
