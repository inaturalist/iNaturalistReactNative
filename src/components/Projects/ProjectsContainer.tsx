import _ from "lodash";
import React, { useState } from "react";
import {
  useCurrentUser,
  useLocationPermission,
  useTranslation
} from "sharedHooks";

import fetchUserLocation from "../../sharedHelpers/fetchUserLocation";
import useInfiniteProjectsScroll from "./hooks/useInfiniteProjectsScroll";
import Projects from "./Projects";

export enum TAB_ID {
  // eslint-disable-next-line no-unused-vars
  JOINED = "JOINED",
  // eslint-disable-next-line no-unused-vars
  FEATURED = "FEATURED",
  // eslint-disable-next-line no-unused-vars
  NEARBY = "NEARBY"
}

const ProjectsContainer = ( ) => {
  const [searchInput, setSearchInput] = useState( "" );
  const currentUser = useCurrentUser( );
  const memberId = currentUser?.id;
  const { t } = useTranslation( );
  const [currentTabId, setCurrentTabId] = useState( currentUser
    ? TAB_ID.JOINED
    : TAB_ID.FEATURED );
  const { hasPermissions, renderPermissionsGate, requestPermissions } = useLocationPermission( );
  const [userLocation, setUserLocation] = useState( null );

  console.log( userLocation, "user location" );

  const apiParams = { };

  if ( currentTabId === TAB_ID.JOINED ) {
    apiParams.member_id = memberId;
  } else if ( currentTabId === TAB_ID.FEATURED ) {
    apiParams.featured = true;
  } else if ( currentTabId === TAB_ID.NEARBY && userLocation ) {
    apiParams.lat = userLocation.latitude;
    apiParams.lng = userLocation.longitude;
    apiParams.radius = 50;
  }

  if ( searchInput.length > 0 ) {
    apiParams.q = searchInput;
  }

  console.log( apiParams, "api params" );

  const {
    isFetchingNextPage,
    fetchNextPage,
    projects,
    status
  } = useInfiniteProjectsScroll( {
    params: apiParams,
    enabled: !_.isEmpty( apiParams )
  } );

  const tabs = [
    {
      id: TAB_ID.JOINED,
      text: t( "JOINED" ),
      onPress: () => {
        setCurrentTabId( TAB_ID.JOINED );
      }
    },
    {
      id: TAB_ID.FEATURED,
      text: t( "FEATURED" ),
      onPress: () => {
        setCurrentTabId( TAB_ID.FEATURED );
      }
    },
    {
      id: TAB_ID.NEARBY,
      text: t( "NEARBY" ),
      onPress: () => {
        setCurrentTabId( TAB_ID.NEARBY );
      }
    }
  ];

  const onPermissionGranted = async ( ) => {
    const currentUserLocation = await fetchUserLocation( );
    setUserLocation( currentUserLocation );
  };

  if ( !currentUser ) {
    tabs.shift( );
  }

  return (
    <>
      <Projects
        currentTabId={currentTabId}
        fetchNextPage={fetchNextPage}
        hasPermissions={hasPermissions}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={status === "pending"}
        memberId={memberId}
        projects={projects}
        requestPermissions={requestPermissions}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        tabs={tabs}
      />
      {renderPermissionsGate( { onPermissionGranted } )}
    </>
  );
};

export default ProjectsContainer;
