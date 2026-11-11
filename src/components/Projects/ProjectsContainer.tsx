import { PROJECT_SUMMARY_FIELDS } from "api/fields";
import isEmpty from "lodash/isEmpty";
import React, { useCallback, useState } from "react";
import {
  useCurrentUser,
  useLocationPermission,
  useTranslation,
} from "sharedHooks";

import type { UserLocation } from "../../sharedHelpers/fetchCoarseUserLocation";
import fetchCoarseUserLocation from "../../sharedHelpers/fetchCoarseUserLocation";
import type { UseInfiniteProjectsScrollOptions } from "./hooks/useInfiniteProjectsScroll";
import useInfiniteProjectsScroll from "./hooks/useInfiniteProjectsScroll";
import useJoinedProjects from "./hooks/useJoinedProjects";
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
  const [userLocation, setUserLocation] = useState<UserLocation | null>( null );

  const apiParams: UseInfiniteProjectsScrollOptions["params"] = {
    fields: PROJECT_SUMMARY_FIELDS,
  };

  const showJoinedProjects = currentTabId === TAB_ID.JOINED && searchInput.length === 0;

  if ( searchInput.length > 0 ) {
    apiParams.q = searchInput;
  } else if ( currentTabId === TAB_ID.FEATURED ) {
    apiParams.featured = true;
  } else if ( currentTabId === TAB_ID.NEARBY && userLocation ) {
    // lifted params for nearby from iOS Projects for app parity
    // https://github.com/inaturalist/INaturalistIOS/blob/20aa47385471f3eb10622b022c51cabc602422ae/INaturalistIOS/API%20Endpoints/Node%20API/ProjectsAPI.m#L48
    apiParams.lat = userLocation.latitude;
    apiParams.lng = userLocation.longitude;
    apiParams.order_by = "distance";
    apiParams.spam = false;
  }

  const getCurrentUserLocation = async ( ) => {
    const currentUserLocation = await fetchCoarseUserLocation( );
    setUserLocation( currentUserLocation );
  };

  const {
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    projects: searchedProjects,
  } = useInfiniteProjectsScroll( {
    params: apiParams,
    enabled: !showJoinedProjects && !isEmpty( apiParams ),
  } );

  // Joined projects all load at once, so this tab has no next page to fetch
  const {
    isFetching: isFetchingJoinedProjects,
    projects: joinedProjects,
  } = useJoinedProjects( memberId, showJoinedProjects );

  const projects = showJoinedProjects
    ? joinedProjects
    : searchedProjects;

  const tabs = [
    {
      id: TAB_ID.JOINED,
      text: t( "JOINED" ),
      onPress: () => {
        setCurrentTabId( TAB_ID.JOINED );
      },
    },
    {
      id: TAB_ID.FEATURED,
      text: t( "FEATURED" ),
      onPress: () => {
        setCurrentTabId( TAB_ID.FEATURED );
      },
    },
    {
      id: TAB_ID.NEARBY,
      text: t( "NEARBY" ),
      onPress: ( ) => {
        if ( hasPermissions ) {
          getCurrentUserLocation( );
        }
        setCurrentTabId( TAB_ID.NEARBY );
      },
    },
  ];

  if ( !currentUser ) {
    tabs.shift( );
  }

  const handleFetchNextPage = useCallback( () => {
    if ( currentTabId !== TAB_ID.FEATURED && !showJoinedProjects ) {
      fetchNextPage();
    }
  }, [currentTabId, fetchNextPage, showJoinedProjects] );

  return (
    <>
      <Projects
        currentTabId={currentTabId}
        fetchNextPage={handleFetchNextPage}
        hasPermissions={hasPermissions}
        isFetchingNextPage={!showJoinedProjects && isFetchingNextPage}
        isLoading={showJoinedProjects
          ? isFetchingJoinedProjects
          : isFetching}
        memberId={memberId}
        projects={projects}
        requestPermissions={requestPermissions}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        tabs={tabs}
      />
      {renderPermissionsGate( { onPermissionGranted: getCurrentUserLocation } )}
    </>
  );
};

export default ProjectsContainer;
