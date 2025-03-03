// import {
//   useNetInfo
// } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
// import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams.ts";
import {
// FETCH_STATUS_LOADING
// FETCH_STATUS_OFFLINE_ERROR,
// FETCH_STATUS_OFFLINE_FETCHED,
// FETCH_STATUS_ONLINE_ERROR,
// FETCH_STATUS_ONLINE_FETCHED,
// initialSuggestions
} from "components/Suggestions/SuggestionsContainer.tsx";
import _ from "lodash";
import { RealmContext } from "providers/contexts.ts";
import React, {
  useCallback, useRef
} from "react";
import saveObservation from "sharedHelpers/saveObservation.ts";
import {
  reorderSuggestionsAfterNewSelection
} from "sharedHelpers/sortSuggestionsForMatch.ts";
import {
  useExitObservationFlow,
  useLocationPermission,
  useSuggestionsForMatch
} from "sharedHooks";
import useStore from "stores/useStore";

import Match from "./Match";

// const setQueryKey = ( selectedPhotoUri, shouldUseEvidenceLocation ) => [
//   "scoreImage",
//   selectedPhotoUri,
//   { shouldUseEvidenceLocation }
// ];

// const initialState = {
//   fetchStatus: FETCH_STATUS_LOADING,
//   scoreImageParams: null,
//   queryKey: [],
//   shouldUseEvidenceLocation: false,
//   orderedSuggestions: []
// };

// const reducer = ( state, action ) => {
//   switch ( action.type ) {
//     // case "SET_UPLOAD_PARAMS":
//     //   return {
//     //     ...state,
//     //     scoreImageParams: action.scoreImageParams,
//     //     queryKey: setQueryKey(
// action.scoreImageParams.image.uri, state.shouldUseEvidenceLocation )
//     //   };
//     // case "SET_FETCH_STATUS":
//     //   return {
//     //     ...state,
//     //     fetchStatus: action.fetchStatus
//     //   };
//     case "TOGGLE_LOCATION":
//       return {
//         ...state,
//         fetchStatus: FETCH_STATUS_LOADING,
//         scoreImageParams: action.scoreImageParams,
//         shouldUseEvidenceLocation: action.shouldUseEvidenceLocation,
//         queryKey: setQueryKey(
// action.scoreImageParams.image.uri, action.shouldUseEvidenceLocation )
//       };
//     // case "ORDER_SUGGESTIONS":
//     //   return {
//     //     ...state,
//     //     orderedSuggestions: action.orderedSuggestions
//     //   };
//     default:
//       throw new Error( );
//   }
// };
const { useRealm } = RealmContext;

const MatchContainer = ( ) => {
  // const hasLoadedRef = useRef( false );
  const scrollRef = useRef( null );
  const currentObservation = useStore( state => state.currentObservation );
  const getCurrentObservation = useStore( state => state.getCurrentObservation );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const setTopAndOtherSuggestions = useStore( state => state.setTopAndOtherSuggestions );
  const topSuggestion = useStore( state => state.topSuggestion );
  const otherSuggestions = useStore( state => state.otherSuggestions );
  const suggestionsList = useStore( state => state.suggestionsList );
  const setSuggestionsList = useStore( state => state.setSuggestionsList );

  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  // const setShouldUseLocation = useStore( state => state.setShouldUseLocation );
  const navigation = useNavigation( );
  const { hasPermissions, renderPermissionsGate, requestPermissions } = useLocationPermission( );

  console.log( topSuggestion, otherSuggestions, "top and other match" );

  useSuggestionsForMatch( );

  const obsPhotos = currentObservation?.observationPhotos;

  // const observationPhoto = obsPhotos?.[0]?.photo?.url
  //   || obsPhotos?.[0]?.photo?.localFilePath;

  const realm = useRealm( );
  const exitObservationFlow = useExitObservationFlow( {
    skipStoreReset: true
  } );

  const openLocationPicker = ( ) => {
    navigation.navigate( "LocationPicker" );
  };

  const handleLocationPickerPressed = ( ) => {
    if ( hasPermissions ) {
      openLocationPicker( );
    } else {
      requestPermissions( );
    }
  };

  // const { isConnected } = useNetInfo( );

  // const evidenceHasLocation = !!currentObservation?.latitude;

  // const [topSuggestion, setTopSuggestion] = useState( );
  // const [state, dispatch] = useReducer( reducer, {
  //   ...initialState,
  //   shouldUseEvidenceLocation: evidenceHasLocation
  // } );

  // const {
  // scoreImageParams,
  // fetchStatus,
  // queryKey,
  // shouldUseEvidenceLocation,
  // orderedSuggestions
  // } = state;

  // const shouldFetchOnlineSuggestions = ( hasPermissions !== undefined )
  //     && fetchStatus === FETCH_STATUS_LOADING;

  // const onlineSuggestionsAttempted = fetchStatus === FETCH_STATUS_ONLINE_FETCHED
  //     || fetchStatus === FETCH_STATUS_ONLINE_ERROR;

  // const onFetchError = useCallback( ( { isOnline } ) => dispatch( {
  //   type: "SET_FETCH_STATUS",
  //   fetchStatus: isOnline
  //     ? FETCH_STATUS_ONLINE_ERROR
  //     : FETCH_STATUS_OFFLINE_ERROR
  // } ), [] );

  // const onFetched = useCallback( ( { isOnline } ) => dispatch( {
  //   type: "SET_FETCH_STATUS",
  //   fetchStatus: isOnline
  //     ? FETCH_STATUS_ONLINE_FETCHED
  //     : FETCH_STATUS_OFFLINE_FETCHED
  // } ), [] );

  // const {
  //   suggestions
  // } = useSuggestions( observationPhoto, {
  //   shouldFetchOnlineSuggestions,
  //   onFetchError,
  //   onFetched,
  //   scoreImageParams,
  //   queryKey,
  //   onlineSuggestionsAttempted
  // } );

  const scrollToTop = useCallback( ( ) => {
    if ( scrollRef.current ) {
      scrollRef.current.scrollTo( { y: 0, animated: true } );
    }
  }, [] );

  const onSuggestionChosen = useCallback( selection => {
    const reorderedSuggestions = reorderSuggestionsAfterNewSelection( selection, suggestionsList );
    const {
      topSuggestion: newTopSuggestion,
      otherSuggestions: newOtherSuggestions
    } = reorderedSuggestions;
    setTopAndOtherSuggestions( newTopSuggestion, newOtherSuggestions );
    setSuggestionsList( reorderedSuggestions );
    scrollToTop( );
  }, [
    suggestionsList,
    scrollToTop,
    setTopAndOtherSuggestions,
    setSuggestionsList
  ] );

  // const createUploadParams = useCallback( async ( uri, showLocation ) => {
  //   const newImageParams = await flattenUploadParams( uri );
  //   if ( showLocation && currentObservation?.latitude ) {
  //     newImageParams.lat = currentObservation?.latitude;
  //     newImageParams.lng = currentObservation?.longitude;
  //   }
  //   return newImageParams;
  // }, [
  //   currentObservation
  // ] );

  // const setImageParams = useCallback( async ( ) => {
  //   if ( isConnected === false ) {
  //     return;
  //   }
  //   const newImageParams = await createUploadParams( observationPhoto,
  // shouldUseEvidenceLocation );
  //   dispatch( { type: "SET_UPLOAD_PARAMS", scoreImageParams: newImageParams } );
  // }, [
  //   createUploadParams,
  //   isConnected,
  //   observationPhoto,
  //   shouldUseEvidenceLocation
  // ] );

  // useEffect( ( ) => {
  //   const onFocus = navigation.addListener( "focus", ( ) => {
  //     // resizeImage crashes if trying to resize an https:// photo while there is no internet
  //     // in this situation, we can skip creating upload parameters since we're loading
  //     // offline suggestions anyway
  //     if ( !hasLoadedRef.current && _.isEqual( initialSuggestions, suggestions ) ) {
  //       hasLoadedRef.current = true;
  //       setImageParams( );
  //     }
  //   } );
  //   return onFocus;
  // }, [navigation, setImageParams, suggestions] );

  // useEffect( ( ) => {
  //   if ( !suggestions || suggestions.length === 0 ) {
  //     return;
  //   }
  //   const orderedList = [...suggestions.otherSuggestions];
  //   if ( suggestions?.topSuggestion ) {
  //     setTopSuggestion( suggestions?.topSuggestion );
  //     orderedList.unshift( suggestions?.topSuggestion );
  //   }
  //   // make sure list is in order of confidence score
  //   const sortedList = _.orderBy(
  //     orderedList,
  //     suggestion => suggestion.combined_score,
  //     ["desc"]
  //   );
  //   dispatch( {
  //     type: "ORDER_SUGGESTIONS",
  //     orderedSuggestions: sortedList
  //   } );
  // }, [suggestions] );

  const taxon = topSuggestion?.taxon;
  const taxonId = taxon?.id;

  // const suggestionsLoading = fetchStatus === FETCH_STATUS_LOADING;
  const suggestionsLoading = false;
  // Remove the top suggestion from the list of other suggestions
  // const otherSuggestions = orderedSuggestions
  //   .filter( suggestion => suggestion.taxon.id !== taxonId );

  const navToTaxonDetails = photo => {
    const params = { id: taxonId };
    if ( !photo?.isRepresentativeButOtherTaxon ) {
      params.firstPhotoID = photo.id;
    } else {
      params.representativePhoto = photo;
    }
    navigation.push( "TaxonDetails", params );
  };

  const handleSaveOrDiscardPress = async action => {
    if ( action === "save" ) {
      updateObservationKeys( {
        taxon,
        owners_identification_from_vision: true
      } );
      await saveObservation( getCurrentObservation( ), cameraRollUris, realm );
    }
    exitObservationFlow( );
  };

  // console.log( topSuggestion, otherSuggestions, "top and other suggestions match container" );

  if ( !topSuggestion ) {
    return null;
  }

  return (
    <>
      <Match
        observation={currentObservation}
        obsPhotos={obsPhotos}
        onSuggestionChosen={onSuggestionChosen}
        handleSaveOrDiscardPress={handleSaveOrDiscardPress}
        navToTaxonDetails={navToTaxonDetails}
        handleLocationPickerPressed={handleLocationPickerPressed}
        topSuggestion={topSuggestion}
        otherSuggestions={otherSuggestions}
        suggestionsLoading={suggestionsLoading}
        scrollRef={scrollRef}
      />
      {renderPermissionsGate( { onPermissionGranted: openLocationPicker } )}
    </>
  );
};

export default MatchContainer;
