// @flow

// Generic Explore container. Should not be used alone, needs to be wrapped in
// another container that uses ExploreProvider

import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import {
  EXPLORE_ACTION,
  PLACE_MODE,
  useExplore
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useState
} from "react";
import { useCurrentUser } from "sharedHooks";
import useLocationPermission from "sharedHooks/useLocationPermission.tsx";

import Explore from "./Explore";
import mapParamsToAPI from "./helpers/mapParamsToAPI";
import useExploreHeaderCount from "./hooks/useExploreHeaderCount";
import useParams from "./hooks/useParams";

type Props = {
  exploreView: string,
  hideBackButton?: boolean,
  setExploreView: Function,
  setStoredParams: Function
}

const ExploreContainer = ( {
  exploreView,
  hideBackButton,
  setExploreView,
  setStoredParams
}: Props ): Node => {
  const navigation = useNavigation( );
  const { isConnected } = useNetInfo( );
  const currentUser = useCurrentUser( );

  const {
    hasBlockedPermissions: hasBlockedLocationPermissions,
    hasPermissions: hasLocationPermissions,
    renderPermissionsGate,
    requestPermissions: requestLocationPermissions
  } = useLocationPermission( );

  const {
    dispatch,
    makeSnapshot,
    state
  } = useExplore();

  const [showFiltersModal, setShowFiltersModal] = useState( false );

  // Whether or not we can fetch results, *not* whether or not we *are*
  // fetching results. This will be set when we know what data the user wants
  // to view and whether we have the permissions we need to show it, e.g.
  // location permissions to show "nearby" obs
  const [canFetch, setCanFetch] = useState( false );

  useParams( );

  const updateLocation = useCallback( async ( place: Object ) => {
    if ( place === PLACE_MODE.WORLDWIDE ) {
      dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_WORLDWIDE } );
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        placeId: null
      } );
    } else {
      navigation.setParams( { place } );
      dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_PLACE } );
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        place,
        placeId: place?.id,
        placeGuess: place?.display_name
      } );
    }
  }, [dispatch, navigation] );

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

  // need this hook to be top-level enough that ExploreHeaderCount rerenders
  const {
    count,
    isFetching: isFetchingHeaderCount,
    handleUpdateCount,
    setIsFetching: setIsFetchingHeaderCount
  } = useExploreHeaderCount( );

  const closeFiltersModal = ( ) => setShowFiltersModal( false );

  const openFiltersModal = ( ) => {
    setShowFiltersModal( true );
    makeSnapshot( );
  };

  useEffect( ( ) => {
    navigation.addListener( "blur", ( ) => {
      setStoredParams( state );
    } );
  }, [navigation, setStoredParams, state] );

  useEffect( () => {
    if ( hasBlockedLocationPermissions && state?.placeMode !== PLACE_MODE.NEARBY ) {
      updateLocation( PLACE_MODE.WORLDWIDE );
    }
  }, [
    hasBlockedLocationPermissions,
    state?.placeMode,
    updateLocation
  ] );

  // Subviews need the ability to imperatively start fetching, e.g. when the
  // user switches from species to obs view
  const startFetching = useCallback( ( ) => {
    if ( hasLocationPermissions || state?.placeMode !== PLACE_MODE.NEARBY ) {
      setIsFetchingHeaderCount( true );
      setCanFetch( true );
    }
  }, [
    hasLocationPermissions,
    setIsFetchingHeaderCount,
    state?.placeMode
  ] );

  useEffect( ( ) => {
    startFetching( );
  }, [startFetching] );

  return (
    <>
      <Explore
        canFetch={canFetch}
        closeFiltersModal={closeFiltersModal}
        count={count}
        currentExploreView={exploreView}
        filterByIconicTaxonUnknown={
          () => dispatch( { type: EXPLORE_ACTION.FILTER_BY_ICONIC_TAXON_UNKNOWN } )
        }
        handleUpdateCount={handleUpdateCount}
        hasLocationPermissions={hasLocationPermissions}
        hideBackButton={hideBackButton}
        isConnected={isConnected}
        isFetchingHeaderCount={isFetchingHeaderCount}
        openFiltersModal={openFiltersModal}
        placeMode={state.placeMode}
        queryParams={queryParams}
        requestLocationPermissions={requestLocationPermissions}
        setCurrentExploreView={setExploreView}
        showFiltersModal={showFiltersModal}
        startFetching={startFetching}
        updateLocation={updateLocation}
        updateProject={updateProject}
        updateTaxon={taxon => dispatch( { type: EXPLORE_ACTION.CHANGE_TAXON, taxon } )}
        updateUser={updateUser}
      />
      {renderPermissionsGate( {
        onPermissionGranted: startFetching
      } ) }
    </>
  );
};

export default ExploreContainer;
