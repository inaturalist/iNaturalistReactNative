// @flow

import { useRoute } from "@react-navigation/native";
import {
  EXPLORE_ACTION,
  useExplore
} from "providers/ExploreContext.tsx";
import { useCallback, useEffect } from "react";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

const useParams = ( ): object => {
  const { t } = useTranslation( );
  const { params } = useRoute( );
  const { dispatch, setExploreLocation } = useExplore( );
  const storedParams = useStore( state => state.storedParams );

  const worldwidePlaceText = t( "Worldwide" );

  const updateContextWithParams = useCallback( async ( storedState = { } ) => {
    const setWorldwide = ( ) => {
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        storedState,
        placeId: null,
        placeGuess: worldwidePlaceText
      } );
    };

    if ( params?.worldwide ) {
      setWorldwide( );
    }
    if ( params?.nearby ) {
      const exploreLocation = await setExploreLocation( );
      dispatch( {
        type: EXPLORE_ACTION.SET_EXPLORE_LOCATION,
        exploreLocation
      } );
    }
    if ( params?.taxon ) {
      dispatch( {
        type: EXPLORE_ACTION.CHANGE_TAXON,
        storedState,
        taxon: params.taxon,
        taxonId: params.taxon?.id,
        taxonName: params.taxon?.preferred_common_name || params.taxon?.name
      } );
    }
    if ( params?.place ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        storedState,
        placeId: params.place?.id,
        placeGuess: params.place?.display_name
      } );
    }
    if ( params?.user && params?.user.id ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_USER,
        storedState,
        user: params.user,
        userId: params.user.id
      } );
    }
    if ( params?.project && params?.project.id ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_PROJECT,
        storedState,
        project: params.project,
        projectId: params.project.id
      } );
    }
  }, [params, dispatch, worldwidePlaceText, setExploreLocation] );

  useEffect( ( ) => {
    if ( params?.resetStoredParams ) {
      updateContextWithParams( );
    } else {
      const storedState = Object.keys( storedParams ).length > 0 || false;

      if ( !storedState ) {
        updateContextWithParams( );
      } else {
        updateContextWithParams( storedParams );
      }
    }
  }, [
    dispatch,
    params,
    storedParams,
    updateContextWithParams
  ] );

  return null;
};

export default useParams;
