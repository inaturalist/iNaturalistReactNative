// @flow

import { useNavigation } from "@react-navigation/native";
import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate.tsx";
import {
  EXPLORE_ACTION,
  ExploreProvider,
  useExplore
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useState
} from "react";
import { useCurrentUser, useIsConnected, useTranslation } from "sharedHooks";
import useLocationPermission from "sharedHooks/useLocationPermission.tsx";
import useStore from "stores/useStore";

import Explore from "./Explore";
import mapParamsToAPI from "./helpers/mapParamsToAPI";
import useHeaderCount from "./hooks/useHeaderCount";

const RootExploreContainerWithContext = ( ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const isOnline = useIsConnected( );
  const currentUser = useCurrentUser( );
  const rootStoredParams = useStore( state => state.rootStoredParams );
  const setRootStoredParams = useStore( state => state.setRootStoredParams );
  const {
    hasPermissions: hasLocationPermissions,
    renderPermissionsGate,
    requestPermissions: requestLocationPermissions
  } = useLocationPermission( );

  console.log( "LocationPermissionGate", LocationPermissionGate );

  const worldwidePlaceText = t( "Worldwide" );

  const {
    state, dispatch, makeSnapshot, defaultExploreLocation
  } = useExplore( );

  const [showFiltersModal, setShowFiltersModal] = useState( false );

  const updateLocation = ( place: Object ) => {
    if ( place === "worldwide" ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        placeId: null,
        placeGuess: worldwidePlaceText
      } );
    } else {
      navigation.setParams( { place } );
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        place,
        placeId: place?.id,
        placeGuess: place?.display_name
      } );
    }
  };

  const updateUser = ( user: Object ) => {
    dispatch( {
      type: EXPLORE_ACTION.SET_USER,
      user,
      userId: user?.id
    } );
  };

  const updateProject = ( project: Object ) => {
    dispatch( {
      type: EXPLORE_ACTION.SET_PROJECT,
      project,
      projectId: project?.id
    } );
  };

  const filteredParams = mapParamsToAPI(
    state,
    currentUser
  );

  const queryParams = {
    ...filteredParams,
    per_page: 20
  };

  // need this hook to be top-level enough that HeaderCount rerenders
  const { count, loadingStatus, updateCount } = useHeaderCount( );

  const closeFiltersModal = ( ) => setShowFiltersModal( false );

  const openFiltersModal = ( ) => {
    setShowFiltersModal( true );
    makeSnapshot( );
  };

  const onPermissionGranted = useCallback( async ( ) => {
    const exploreLocation = await defaultExploreLocation( );
    dispatch( {
      type: EXPLORE_ACTION.SET_EXPLORE_LOCATION,
      exploreLocation
    } );
  }, [
    defaultExploreLocation,
    dispatch
  ] );
  console.log( "onPermissionGranted", onPermissionGranted );

  const resetToWorldWide = useCallback( ( ) => {
    dispatch( {
      type: EXPLORE_ACTION.SET_PLACE,
      placeGuess: worldwidePlaceText
    } );
  }, [dispatch, worldwidePlaceText] );
  console.log( "resetToWorldWide", resetToWorldWide );

  useEffect( ( ) => {
    navigation.addListener( "focus", ( ) => {
      const storedState = Object.keys( rootStoredParams ).length > 0 || false;

      if ( storedState ) {
        dispatch( { type: EXPLORE_ACTION.USE_STORED_STATE, storedState: rootStoredParams } );
      }
    } );

    navigation.addListener( "blur", ( ) => {
      setRootStoredParams( state );
    } );
  }, [navigation, setRootStoredParams, state, dispatch, rootStoredParams] );

  return (
    <>
      <Explore
        closeFiltersModal={closeFiltersModal}
        count={count}
        hideBackButton
        filterByIconicTaxonUnknown={
          () => dispatch( { type: EXPLORE_ACTION.FILTER_BY_ICONIC_TAXON_UNKNOWN } )
        }
        isOnline={isOnline}
        loadingStatus={loadingStatus}
        openFiltersModal={openFiltersModal}
        queryParams={queryParams}
        showFiltersModal={showFiltersModal}
        updateCount={updateCount}
        updateTaxon={taxon => dispatch( { type: EXPLORE_ACTION.CHANGE_TAXON, taxon } )}
        updateLocation={updateLocation}
        updateUser={updateUser}
        updateProject={updateProject}
        placeMode={state.placeMode}
        hasLocationPermissions={hasLocationPermissions}
        requestLocationPermissions={requestLocationPermissions}
      />
      {renderPermissionsGate( )}
      {/* <LocationPermissionGate
        permissionNeeded
        onPermissionGranted={onPermissionGranted}
        onPermissionDenied={resetToWorldWide}
        onPermissionBlocked={resetToWorldWide}
        withoutNavigation
      /> */}
    </>
  );
};

const RootExploreContainer = (): Node => (
  <ExploreProvider>
    <RootExploreContainerWithContext />
  </ExploreProvider>
);

export default RootExploreContainer;
