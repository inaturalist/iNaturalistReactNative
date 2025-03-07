// @flow
import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { fetchSubscriptions } from "api/observations";
import IdentificationSheets from "components/ObsDetailsDefaultMode/IdentificationSheets.tsx";
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from "react";
import { LogBox } from "react-native";
import Observation from "realmModels/Observation";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  useAuthenticatedQuery,
  useCurrentUser,
  useLocalObservation,
  useObservationsUpdates
} from "sharedHooks";
import useRemoteObservation, {
  fetchRemoteObservationKey
} from "sharedHooks/useRemoteObservation";
import useStore from "stores/useStore";

import useMarkViewedMutation from "./hooks/useMarkViewedMutation";
import ObsDetailsDefaultMode from "./ObsDetailsDefaultMode";

const { useRealm } = RealmContext;

// this is getting triggered by passing dates, like _created_at, through
// react navigation via the observation object. it doesn't seem to
// actually be breaking anything, for the moment (May 2, 2022)
LogBox.ignoreLogs( [
  "Non-serializable values were found in the navigation state"
] );

const sortItems = ( ids, comments ) => ids.concat( [...comments] ).sort(
  ( a, b ) => ( new Date( a.created_at ) - new Date( b.created_at ) )
);

const SHOW_AGREE_SHEET = "SHOW_AGREE_SHEET";
const HIDE_AGREE_SHEET = "HIDE_AGREE_SHEET";
const SET_ADD_COMMENT_SHEET = "SET_ADD_COMMENT_SHEET";
const SET_INITIAL_OBSERVATION = "SET_INITIAL_OBSERVATION";
const ADD_ACTIVITY_ITEM = "ADD_ACTIVITY_ITEM";
const LOADING_ACTIVITY_ITEM = "LOADING_ACTIVITY_ITEM";

const initialState = {
  activityItems: [],
  addingActivityItem: false,
  observationShown: null,
  showAddCommentSheet: false
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case SET_INITIAL_OBSERVATION:
      return {
        ...state,
        observationShown: action.observationShown,
        activityItems: sortItems(
          action.observationShown?.identifications || [],
          action.observationShown?.comments || []
        )
      };
    case ADD_ACTIVITY_ITEM:
      return {
        ...state,
        observationShown: action.observationShown,
        addingActivityItem: false,
        activityItems: sortItems(
          action.observationShown?.identifications || [],
          action.observationShown?.comments || []
        )
      };
    case LOADING_ACTIVITY_ITEM:
      return {
        ...state,
        addingActivityItem: true
      };

    case SHOW_AGREE_SHEET:
      return {
        ...state,
        showAgreeWithIdSheet: true,
        agreeIdentification: action.agreeIdentification
      };
    case HIDE_AGREE_SHEET:
      return {
        ...state,
        showAgreeWithIdSheet: false,
        agreeIdentification: null
      };
    case SET_ADD_COMMENT_SHEET:
      return {
        ...state,
        commentIsOptional: action.commentIsOptional,
        showAddCommentSheet: action.showAddCommentSheet
      };
    default:
      throw new Error( );
  }
};

const ObsDetailsDefaultModeContainer = ( ): Node => {
  const setObservations = useStore( state => state.setObservations );
  const currentUser = useCurrentUser( );
  const { params } = useRoute();
  const {
    targetActivityItemID,
    uuid
  } = params;
  const navigation = useNavigation( );
  const realm = useRealm( );
  const { isConnected } = useNetInfo( );
  const [state, dispatch] = useReducer( reducer, initialState );
  const [remoteObsWasDeleted, setRemoteObsWasDeleted] = useState( false );

  const {
    activityItems,
    addingActivityItem,
    agreeIdentification,
    observationShown,
    showAddCommentSheet,
    showAgreeWithIdSheet
  } = state;
  const queryClient = useQueryClient( );

  const localObservation = useLocalObservation( uuid );
  const wasSynced = localObservation && localObservation?.wasSynced();

  const fetchRemoteObservationEnabled = !!(
    !remoteObsWasDeleted
    && ( !localObservation || localObservation?.wasSynced( ) )
    && isConnected
  );

  const {
    remoteObservation,
    refetchRemoteObservation,
    isRefetching,
    fetchRemoteObservationError
  } = useRemoteObservation( uuid, fetchRemoteObservationEnabled );

  useMarkViewedMutation( localObservation, remoteObservation );

  // If we tried to get a remote observation but it no longer exists, the user
  // can't do anything so we need to send them back and remove the local
  // copy of this observation
  useEffect( ( ) => {
    setRemoteObsWasDeleted( fetchRemoteObservationError?.status === 404 );
  }, [fetchRemoteObservationError?.status] );
  const confirmRemoteObsWasDeleted = useCallback( ( ) => {
    if ( localObservation ) {
      safeRealmWrite( realm, ( ) => {
        localObservation._deleted_at = new Date( );
      }, "adding _deleted_at date in ObsDetailsContainer" );
    }
    if ( navigation.canGoBack( ) ) navigation.goBack( );
  }, [
    localObservation,
    navigation,
    realm
  ] );

  const observation = localObservation || Observation.mapApiToRealm( remoteObservation );
  const hasPhotos = observation?.observationPhotos?.length > 0;

  // In theory the only situation in which an observation would not have a
  // user is when a user is not signed but has made a new observation in the
  // app. Also in theory that user should not be able to get to ObsDetail for
  // those observations, just ObsEdit. But.... let's be safe.
  const belongsToCurrentUser = (
    observation?.user?.id === currentUser?.id
    || ( !observation?.user && !observation?.id )
  );

  const isSimpleMode = useMemo( () => (
    // Simple mode applies only when:
    // 1. It's the current user's observation (or an observation being created)
    // 2. AND the observation hasn't been synced yet
    // 3. AND the user isn't logged in
    ( belongsToCurrentUser || !observation?.user )
      && localObservation
      && !localObservation.wasSynced()
      && !currentUser
  ), [belongsToCurrentUser, localObservation, currentUser, observation?.user] );

  const { data: subscriptions, refetch: refetchSubscriptions } = useAuthenticatedQuery(
    [
      "fetchSubscriptions"
    ],
    optsWithAuth => fetchSubscriptions( { uuid, fields: "user_id" }, optsWithAuth ),
    {
      enabled: !!( currentUser ) && !belongsToCurrentUser
    }
  );

  const invalidateRemoteObservationFetch = useCallback( ( ) => {
    if ( observation?.uuid ) {
      queryClient.invalidateQueries( {
        queryKey: [fetchRemoteObservationKey, observation.uuid]
      } );
    }
  }, [queryClient, observation?.uuid] );

  useFocusEffect(
    // this ensures activity items load after a user taps suggest id
    // and adds a remote id on the Suggestions screen
    useCallback( ( ) => {
      invalidateRemoteObservationFetch( );
    }, [invalidateRemoteObservationFetch] )
  );

  useEffect( ( ) => {
    if ( !observationShown ) {
      dispatch( {
        type: SET_INITIAL_OBSERVATION,
        observationShown: observation
      } );
    }
  }, [observation, observationShown] );

  useEffect( ( ) => {
    // if observation does not belong to current user, show
    // new activity items after a refetch
    if ( remoteObservation && !isRefetching ) {
      dispatch( {
        type: ADD_ACTIVITY_ITEM,
        observationShown: Observation.mapApiToRealm( remoteObservation )
      } );
    }
  }, [remoteObservation, isRefetching] );

  const { refetch: refetchObservationUpdates } = useObservationsUpdates(
    !!currentUser && !!observation
  );

  const openAddCommentSheet = useCallback( ( { isOptional = false } ) => {
    dispatch( {
      type: SET_ADD_COMMENT_SHEET,
      showAddCommentSheet: true,
      commentIsOptional: isOptional || false
    } );
  }, [] );

  const hideAddCommentSheet = useCallback( ( ) => dispatch( {
    type: SET_ADD_COMMENT_SHEET,
    showAddCommentSheet: false,
    comment: null
  } ), [] );

  const openAgreeWithIdSheet = useCallback( taxon => {
    dispatch( {
      type: SHOW_AGREE_SHEET,
      agreeIdentification: { taxon }
    } );
  }, [] );

  const navToSuggestions = useCallback( ( ) => {
    setObservations( [observation] );
    if ( hasPhotos ) {
      navigation.push( "Suggestions", {
        entryScreen: "ObsDetails",
        lastScreen: "ObsDetails",
        hideSkip: true
      } );
    } else {
      // Go directly to taxon search in case there are no photos
      navigation.navigate( "SuggestionsTaxonSearch", { lastScreen: "ObsDetails" } );
    }
  }, [hasPhotos, navigation, observation, setObservations] );

  const invalidateQueryAndRefetch = useCallback( ( ) => {
    invalidateRemoteObservationFetch( );
    refetchRemoteObservation( );
    refetchObservationUpdates( );
  }, [invalidateRemoteObservationFetch, refetchObservationUpdates, refetchRemoteObservation] );

  const subscriptionResults = !belongsToCurrentUser
    ? subscriptions?.results
    : [];

  const handleIdentificationMutationSuccess = useCallback( data => {
    refetchRemoteObservation( );
    if ( belongsToCurrentUser ) {
      const createdIdent = data[0];
      // Try to find an existing taxon b/c otherwise realm will try to
      // create the taxon when updating the observation and error out
      let taxon;
      if ( createdIdent.taxon?.id ) {
        taxon = realm?.objectForPrimaryKey( "Taxon", createdIdent.taxon.id );
      }
      taxon = taxon || createdIdent.taxon;
      safeRealmWrite( realm, ( ) => {
        createdIdent.user = currentUser;
        if ( taxon ) createdIdent.taxon = taxon;
        localObservation?.identifications?.push( createdIdent );
      }, "setting local identification in ObsDetailsContainer" );
      if ( uuid ) {
        const updatedLocalObservation = realm.objectForPrimaryKey( "Observation", uuid );
        dispatch( { type: "ADD_ACTIVITY_ITEM", observationShown: updatedLocalObservation } );
      }
    }
  }, [
    belongsToCurrentUser,
    currentUser,
    localObservation?.identifications,
    realm,
    refetchRemoteObservation,
    uuid
  ] );

  const handleCommentMutationSuccess = useCallback( data => {
    refetchRemoteObservation( );
    if ( belongsToCurrentUser ) {
      safeRealmWrite( realm, ( ) => {
        const localComments = localObservation?.comments;
        const newComment = data[0];
        newComment.user = currentUser;
        localComments.push( newComment );
      }, "setting local comment in ObsDetailsContainer" );
      const updatedLocalObservation = realm.objectForPrimaryKey( "Observation", uuid );
      dispatch( { type: "ADD_ACTIVITY_ITEM", observationShown: updatedLocalObservation } );
    }
  }, [
    belongsToCurrentUser,
    currentUser,
    localObservation?.comments,
    realm,
    refetchRemoteObservation,
    uuid
  ] );

  const closeAgreeWithIdSheet = useCallback( ( ) => {
    dispatch( { type: HIDE_AGREE_SHEET } );
  }, [] );

  const loadActivityItem = useCallback( ( ) => {
    dispatch( { type: LOADING_ACTIVITY_ITEM } );
  }, [] );

  return observationShown && (
    <>
      <ObsDetailsDefaultMode
        activityItems={activityItems}
        addingActivityItem={addingActivityItem}
        belongsToCurrentUser={belongsToCurrentUser}
        currentUser={currentUser}
        isConnected={isConnected}
        isSimpleMode={isSimpleMode}
        navToSuggestions={navToSuggestions}
        observation={observationShown}
        openAddCommentSheet={openAddCommentSheet}
        openAgreeWithIdSheet={openAgreeWithIdSheet}
        refetchRemoteObservation={invalidateQueryAndRefetch}
        refetchSubscriptions={refetchSubscriptions}
        showAddCommentSheet={showAddCommentSheet}
        subscriptions={subscriptionResults}
        targetActivityItemID={targetActivityItemID}
        wasSynced={wasSynced}
        uuid={uuid}
      />
      <IdentificationSheets
        agreeIdentification={agreeIdentification}
        closeAgreeWithIdSheet={closeAgreeWithIdSheet}
        confirmRemoteObsWasDeleted={confirmRemoteObsWasDeleted}
        handleCommentMutationSuccess={handleCommentMutationSuccess}
        handleIdentificationMutationSuccess={handleIdentificationMutationSuccess}
        hideAddCommentSheet={hideAddCommentSheet}
        loadActivityItem={loadActivityItem}
        observation={observationShown}
        remoteObsWasDeleted={remoteObsWasDeleted}
        showAddCommentSheet={showAddCommentSheet}
        showAgreeWithIdSheet={showAgreeWithIdSheet}
      />
    </>
  );
};

export default ObsDetailsDefaultModeContainer;
