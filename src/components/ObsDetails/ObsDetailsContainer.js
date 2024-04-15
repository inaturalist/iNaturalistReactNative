// @flow
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { createComment } from "api/comments";
import { createIdentification } from "api/identifications";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useReducer,
  useState
} from "react";
import { Alert, LogBox } from "react-native";
import Observation from "realmModels/Observation";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  useAuthenticatedMutation,
  useCurrentUser,
  useIsConnected,
  useLocalObservation,
  useObservationsUpdates,
  useTranslation
} from "sharedHooks";
import useRemoteObservation,
{ fetchRemoteObservationKey } from "sharedHooks/useRemoteObservation";
import { ACTIVITY_TAB_ID, DETAILS_TAB_ID } from "stores/createLayoutSlice";
import useStore from "stores/useStore";

import useMarkViewedMutation from "./hooks/useMarkViewedMutation";
import ObsDetails from "./ObsDetails";

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

const initialState = {
  currentTabId: ACTIVITY_TAB_ID,
  addingActivityItem: false,
  showAgreeWithIdSheet: false,
  showCommentBox: false,
  observationShown: null,
  activityItems: [],
  taxonForAgreement: null
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "SET_INITIAL_OBSERVATION":
      return {
        ...state,
        observationShown: action.observationShown,
        activityItems: sortItems(
          action.observationShown?.identifications || [],
          action.observationShown?.comments || []
        )
      };
    case "ADD_ACTIVITY_ITEM":
      return {
        ...state,
        observationShown: action.observationShown,
        addingActivityItem: false,
        activityItems: sortItems(
          action.observationShown?.identifications || [],
          action.observationShown?.comments || []
        )
      };
    case "LOADING_ACTIVITY_ITEM":
      return {
        ...state,
        addingActivityItem: true
      };
    case "SHOW_AGREE_SHEET":
      return {
        ...state,
        showAgreeWithIdSheet: action.showAgreeWithIdSheet,
        taxonForAgreement: action.taxonForAgreement
      };
    case "SHOW_COMMENT_BOX":
      return {
        ...state,
        showCommentBox: action.showCommentBox
      };
    default:
      throw new Error( );
  }
};

const ObsDetailsContainer = ( ): Node => {
  const setObservations = useStore( state => state.setObservations );
  const currentTabId = useStore( state => state.currentTabId );
  const setCurrentTabId = useStore( state => state.setCurrentTabId );
  const currentUser = useCurrentUser( );
  const { params } = useRoute();
  const {
    comment,
    suggestedTaxonId,
    uuid,
    vision
  } = params;
  const navigation = useNavigation( );
  const realm = useRealm( );
  const { t } = useTranslation( );
  const isOnline = useIsConnected( );

  const [state, dispatch] = useReducer( reducer, initialState );
  const [remoteObsWasDeleted, setRemoteObsWasDeleted] = useState( false );

  const {
    activityItems,
    addingActivityItem,
    observationShown,
    showAgreeWithIdSheet,
    showCommentBox,
    taxonForAgreement
  } = state;

  const queryClient = useQueryClient( );

  const localObservation = useLocalObservation( uuid );

  const fetchRemoteObservationEnabled = !!(
    !remoteObsWasDeleted
    && ( !localObservation || localObservation?.wasSynced( ) )
    && isOnline
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

  // In theory the only situation in which an observation would not have a
  // user is when a user is not signed but has made a new observation in the
  // app. Also in theory that user should not be able to get to ObsDetail for
  // those observations, just ObsEdit. But.... let's be safe.
  const belongsToCurrentUser = (
    observation?.user?.id === currentUser?.id
    || ( !observation?.user && !observation?.id )
  );

  useFocusEffect(
    // this ensures activity items load after a user taps suggest id
    // and adds a remote id on the Suggestions screen
    useCallback( ( ) => {
      queryClient.invalidateQueries( { queryKey: fetchRemoteObservationKey } );
    }, [queryClient] )
  );

  useEffect( ( ) => {
    if ( !observationShown ) {
      dispatch( {
        type: "SET_INITIAL_OBSERVATION",
        observationShown: observation
      } );
    }
  }, [observation, observationShown] );

  useEffect( ( ) => {
    // if observation does not belong to current user, show
    // new activity items after a refetch
    if ( remoteObservation && !isRefetching ) {
      dispatch( {
        type: "ADD_ACTIVITY_ITEM",
        observationShown: remoteObservation
      } );
    }
  }, [remoteObservation, isRefetching] );

  const tabs = [
    {
      id: ACTIVITY_TAB_ID,
      testID: "ObsDetails.ActivityTab",
      onPress: ( ) => setCurrentTabId( ACTIVITY_TAB_ID ),
      text: t( "ACTIVITY" )
    },
    {
      id: DETAILS_TAB_ID,
      testID: "ObsDetails.DetailsTab",
      onPress: () => setCurrentTabId( DETAILS_TAB_ID ),
      text: t( "DETAILS" )
    }
  ];

  const { refetch: refetchObservationUpdates } = useObservationsUpdates(
    !!currentUser && !!observation
  );

  const showErrorAlert = error => Alert.alert( "Error", error, [{ text: t( "OK" ) }], {
    cancelable: true
  } );

  const openCommentBox = ( ) => dispatch( { type: "SHOW_COMMENT_BOX", showCommentBox: true } );

  const createCommentMutation = useAuthenticatedMutation(
    ( commentParams, optsWithAuth ) => createComment( commentParams, optsWithAuth ),
    {
      onSuccess: data => {
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
      },
      onError: e => {
        let error = null;
        if ( e ) {
          error = t( "Couldnt-create-comment", { error: e.message } );
        } else {
          error = t( "Couldnt-create-comment", { error: t( "Unknown-error" ) } );
        }
        showErrorAlert( error );
      }
    }
  );

  const onCommentAdded = commentBody => {
    dispatch( { type: "LOADING_ACTIVITY_ITEM" } );
    createCommentMutation.mutate( {
      comment: {
        body: commentBody,
        parent_id: uuid,
        parent_type: "Observation"
      }
    } );
  };

  const createIdentificationMutation = useAuthenticatedMutation(
    ( idParams, optsWithAuth ) => createIdentification( idParams, optsWithAuth ),
    {
      onSuccess: data => {
        refetchRemoteObservation( );
        if ( belongsToCurrentUser ) {
          safeRealmWrite( realm, ( ) => {
            const localIdentifications = localObservation?.identifications;
            const newIdentification = data[0];
            newIdentification.user = currentUser;
            newIdentification.taxon = realm?.objectForPrimaryKey(
              "Taxon",
              newIdentification.taxon.id
            ) || newIdentification.taxon;
            if ( vision ) {
              newIdentification.vision = true;
            }
            localIdentifications.push( newIdentification );
          }, "setting local identification in ObsDetailsContainer" );
          const updatedLocalObservation = realm.objectForPrimaryKey( "Observation", uuid );
          dispatch( { type: "ADD_ACTIVITY_ITEM", observationShown: updatedLocalObservation } );
        }
      },
      onError: e => {
        let error = null;
        if ( e ) {
          error = t( "Couldnt-create-identification-error", { error: e.message } );
        } else {
          error = t( "Couldnt-create-identification-unknown-error" );
        }
        showErrorAlert( error );
      }
    }
  );

  const onIDAdded = useCallback( () => {
    if ( !suggestedTaxonId ) return;

    // New taxon identification added by user
    const idParams = {
      observation_id: uuid,
      taxon_id: suggestedTaxonId,
      vision
    };

    if ( comment ) {
      // $FlowIgnore
      idParams.body = comment;
    }

    dispatch( { type: "LOADING_ACTIVITY_ITEM" } );
    createIdentificationMutation.mutate( { identification: idParams } );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedTaxonId, uuid, vision] );

  useEffect( () => {
    if ( !suggestedTaxonId ) return;

    onIDAdded();
  }, [onIDAdded, suggestedTaxonId] );

  const navToSuggestions = ( ) => {
    setObservations( [observation] );
    navigation.navigate( "Suggestions", { lastScreen: "ObsDetails" } );
  };

  const showActivityTab = currentTabId === ACTIVITY_TAB_ID;

  const refetchObservation = ( ) => {
    queryClient.invalidateQueries( { queryKey: [fetchRemoteObservationKey] } );
    refetchRemoteObservation( );
    refetchObservationUpdates( );
  };

  const onAgree = newComment => {
    const agreeParams = {
      observation_id: observation?.uuid,
      taxon_id: taxonForAgreement?.id,
      body: newComment
    };

    dispatch( { type: "LOADING_ACTIVITY_ITEM" } );
    createIdentificationMutation.mutate( { identification: agreeParams } );
    dispatch( { type: "SHOW_AGREE_SHEET", showAgreeWithIdSheet: false } );
  };

  const agreeIdSheetDiscardChanges = ( ) => {
    dispatch( { type: "SHOW_AGREE_SHEET", showAgreeWithIdSheet: false } );
  };

  const onIDAgreePressed = taxon => {
    dispatch( { type: "SHOW_AGREE_SHEET", showAgreeWithIdSheet: true, taxonForAgreement: taxon } );
  };

  return (
    <ObsDetails
      activityItems={activityItems}
      addingActivityItem={addingActivityItem}
      agreeIdSheetDiscardChanges={agreeIdSheetDiscardChanges}
      belongsToCurrentUser={belongsToCurrentUser}
      confirmRemoteObsWasDeleted={confirmRemoteObsWasDeleted}
      currentTabId={currentTabId}
      currentUser={currentUser}
      hideCommentBox={( ) => dispatch( { type: "SHOW_COMMENT_BOX", showCommentBox: false } )}
      isOnline={isOnline}
      isRefetching={isRefetching}
      navToSuggestions={navToSuggestions}
      observation={observation}
      onAgree={onAgree}
      onCommentAdded={onCommentAdded}
      onIDAgreePressed={onIDAgreePressed}
      openCommentBox={openCommentBox}
      refetchRemoteObservation={refetchObservation}
      remoteObsWasDeleted={remoteObsWasDeleted}
      showActivityTab={showActivityTab}
      showAgreeWithIdSheet={showAgreeWithIdSheet}
      showCommentBox={showCommentBox}
      tabs={tabs}
      taxonForAgreement={taxonForAgreement}
    />
  );
};

export default ObsDetailsContainer;
