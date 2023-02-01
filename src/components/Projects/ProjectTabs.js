// @flow

import { searchProjects } from "api/projects";
import { Tabs } from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useUserLocation from "sharedHooks/useUserLocation";

import ProjectList from "./ProjectList";

const JOINED_TAB_ID = "JOINED";
const FEATURED_TAB_ID = "FEATURED";
const NEARBY_TAB_ID = "NEARBY";

const ProjectTabs = ( ): Node => {
  const currentUser = useCurrentUser( );
  const memberId = currentUser?.id;
  const [apiParams, setApiParams] = useState( { } );
  const [currentTabId, setCurrentTabId] = useState( JOINED_TAB_ID );
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

  const tabs = [
    {
      id: JOINED_TAB_ID,
      text: t( "Joined" ),
      onPress: () => {
        setCurrentTabId( JOINED_TAB_ID );
        fetchUserJoinedProjects();
      }
    },
    {
      id: FEATURED_TAB_ID,
      text: t( "Featured" ),
      onPress: () => {
        setCurrentTabId( FEATURED_TAB_ID );
        fetchFeaturedProjects();
      }
    },
    {
      id: NEARBY_TAB_ID,
      text: t( "Nearby" ),
      onPress: () => {
        setCurrentTabId( NEARBY_TAB_ID );
        fetchProjectsByLatLng();
      }
    }
  ];

  return (
    <>
      <Tabs tabs={tabs} activeId={currentTabId} />
      <ProjectList data={projects} />
    </>
  );
};

export default ProjectTabs;
