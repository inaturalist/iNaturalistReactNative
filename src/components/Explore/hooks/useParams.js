// @flow

import { useRoute } from "@react-navigation/native";
import {
  EXPLORE_ACTION,
  useExplore,
} from "providers/ExploreContext";
import { useCallback, useEffect } from "react";

const useParams = ( ): Object => {
  const { params } = useRoute( );
  const { dispatch, defaultExploreLocation } = useExplore( );

  const updateContextWithParams = useCallback( async ( ) => {
    const setWorldwide = ( ) => {
      dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_WORLDWIDE } );
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        place: null,
        placeId: null,
      } );
    };

    if ( params?.worldwide ) {
      setWorldwide( );
    }
    if ( params?.nearby ) {
      const exploreLocation = await defaultExploreLocation( );
      // exploreLocation has a placeMode already
      // dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_NEARBY } );
      dispatch( {
        type: EXPLORE_ACTION.SET_EXPLORE_LOCATION,
        exploreLocation,
      } );
    }
    if ( params?.taxon ) {
      dispatch( {
        type: EXPLORE_ACTION.CHANGE_TAXON,
        taxon: params.taxon,
        taxonId: params.taxon?.id,
        taxonName: params.taxon?.preferred_common_name || params.taxon?.name,
      } );
    }
    if ( params?.place ) {
      dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_PLACE } );
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        place: params.place,
        placeId: params.place?.id,
        placeGuess: params.place?.display_name,
      } );
    }
    if ( params?.user && params?.user.id ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_USER,
        user: params.user,
        userId: params.user.id,
      } );
    }
    if ( params?.project && params?.project.id ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_PROJECT,
        project: params.project,
        projectId: params.project.id,
      } );
    }
  }, [
    dispatch,
    params,
    defaultExploreLocation,
  ] );

  useEffect( ( ) => {
    updateContextWithParams( );
  }, [
    updateContextWithParams,
  ] );

  return null;
};

export default useParams;
