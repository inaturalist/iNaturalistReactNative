// @flow

import { searchProjects } from "api/projects";
import Tabs from "components/SharedComponents/Tabs";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useUserLocation from "sharedHooks/useUserLocation";

import ProjectList from "./ProjectList";

const JOINED_TAB = "JOINED";
const FEATURED_TAB = "FEATURED";
const NEARBY_TAB = "NEARBY";

const ProjectTabs = ( ): Node => {
  const currentUser = useCurrentUser( );
  const memberId = currentUser?.id;
  const [apiParams, setApiParams] = useState( { } );
  const [tab, setTab] = useState( JOINED_TAB );
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
      id: JOINED_TAB,
      text: "Joined",
      onPress: () => {
        setTab( JOINED_TAB );
        fetchUserJoinedProjects();
      }
    },
    {
      id: FEATURED_TAB,
      text: "Featured",
      onPress: () => {
        setTab( FEATURED_TAB );
        fetchFeaturedProjects();
      }
    },
    {
      id: NEARBY_TAB,
      text: "Nearby",
      onPress: () => {
        setTab( NEARBY_TAB );
        fetchProjectsByLatLng();
      }
    }
  ];

  return (
    <>
      <Tabs tabs={tabs} activeId={tab} />
      <ProjectList data={projects} />
    </>
  );
};

export default ProjectTabs;
