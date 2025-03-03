// @flow
import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { createComment } from "api/comments";
import { createIdentification } from "api/identifications";
import { fetchSubscriptions } from "api/observations";
import { RealmContext } from "providers/contexts.ts";
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
import { fetchTaxonAndSave } from "sharedHelpers/taxon";
import {
  useAuthenticatedMutation,
  useAuthenticatedQuery,
  useCurrentUser,
  useLocalObservation,
  useObservationsUpdates,
  useTranslation
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

const initialState = {
  activityItems: [],
  addingActivityItem: false,
  comment: null,
  commentIsOptional: false,
  identBodySheetShown: false,
  newIdentification: null,
  observationShown: null,
  showAgreeWithIdSheet: false,
  showAddCommentSheet: false,
  showPotentialDisagreementSheet: false,
  showSuggestIdSheet: false,
  identTaxon: null
};

const CLEAR_SUGGESTED_TAXON = "CLEAR_SUGGESTED_TAXON";
const CONFIRM_ID = "CONFIRM_ID";
const DISCARD_ID = "DISCARD_ID";
const HIDE_AGREE_SHEET = "HIDE_AGREE_SHEET";
const HIDE_EDIT_IDENT_BODY_SHEET = "HIDE_EDIT_IDENT_BODY_SHEET";
const HIDE_POTENTIAL_DISAGREEMENT_SHEET = "HIDE_POTENTIAL_DISAGREEMENT_SHEET";
const SET_ADD_COMMENT_SHEET = "SET_ADD_COMMENT_SHEET";
const SET_IDENT_TAXON = "SET_IDENT_TAXON";
const SET_NEW_IDENTIFICATION = "SET_NEW_IDENTIFICATION";
const SHOW_AGREE_SHEET = "SHOW_AGREE_SHEET";
const SHOW_EDIT_IDENT_BODY_SHEET = "SHOW_EDIT_IDENT_BODY_SHEET";

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
    case SHOW_AGREE_SHEET:
      return {
        ...state,
        showAgreeWithIdSheet: true,
        newIdentification: action.newIdentification
      };
    case HIDE_AGREE_SHEET:
      return {
        ...state,
        showAgreeWithIdSheet: false
      };
    case SET_ADD_COMMENT_SHEET:
      return {
        ...state,
        commentIsOptional: action.commentIsOptional,
        showAddCommentSheet: action.showAddCommentSheet
      };
    case SHOW_EDIT_IDENT_BODY_SHEET:
      return {
        ...state,
        identBodySheetShown: true
      };
    case HIDE_EDIT_IDENT_BODY_SHEET:
      return {
        ...state,
        identBodySheetShown: false
      };
    case "SHOW_SUGGEST_ID_SHEET":
      return {
        ...state,
        showSuggestIdSheet: true
      };
    case "SHOW_POTENTIAL_DISAGREEMENT_SHEET":
      return {
        ...state,
        showPotentialDisagreementSheet: true
      };
    case SET_NEW_IDENTIFICATION:
      return {
        ...state,
        newIdentification: {
          taxon: action.taxon,
          body: action.body,
          vision: action.vision
        }
      };
    case SET_IDENT_TAXON:
      return { ...state, identTaxon: action.taxon };
    case CLEAR_SUGGESTED_TAXON:
      return { ...state, identTaxon: null };
    case CONFIRM_ID:
      return { ...state, showSuggestIdSheet: true };
    case DISCARD_ID:
      return {
        ...state,
        showSuggestIdSheet: false,
        identTaxon: null,
        newIdentification: null
      };
    case HIDE_POTENTIAL_DISAGREEMENT_SHEET:
      return {
        ...state,
        showPotentialDisagreementSheet: false,
        identTaxon: null,
        newIdentification: null
      };
    default:
      throw new Error( );
  }
};

const ObsDetailsContainer = ( ): Node => {
  const setObservations = useStore( state => state.setObservations );
  const currentUser = useCurrentUser( );
  const { params } = useRoute();
  const {
    identAt,
    identTaxonId,
    identTaxonFromVision,
    targetActivityItemID,
    uuid
  } = params;
  const navigation = useNavigation( );
  const realm = useRealm( );
  const { t } = useTranslation( );
  const { isConnected } = useNetInfo( );
  const [state, dispatch] = useReducer( reducer, initialState );
  const [remoteObsWasDeleted, setRemoteObsWasDeleted] = useState( false );

  const {
    activityItems,
    addingActivityItem,
    comment,
    commentIsOptional,
    identBodySheetShown,
    newIdentification,
    observationShown,
    showAddCommentSheet,
    showAgreeWithIdSheet,
    showPotentialDisagreementSheet,
    showSuggestIdSheet,
    identTaxon
  } = state;
  const queryClient = useQueryClient( );

  const localObservation = useLocalObservation( uuid );

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

  // Translates identification-related params to local state
  useEffect( ( ) => {
    async function fetchAndSet() {
      let taxon = realm.objectForPrimaryKey( "Taxon", identTaxonId );
      if ( !taxon ) {
        taxon = await fetchTaxonAndSave( identTaxonId, realm );
      }
      dispatch( {
        type: SET_IDENT_TAXON,
        taxon
      } );
    }
    if ( identTaxonId ) {
      fetchAndSet();
    } else {
      dispatch( { type: CLEAR_SUGGESTED_TAXON } );
    }
  }, [
    // This should change with every new navigation event back to ObsDetails,
    // so even if identTaxonId doesn't change, e.g. you add an ID of taxon X,
    // cancel, then add another ID of taxon X, we still update the identTaxon
    identAt,
    identTaxonId,
    realm
  ] );

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
        observationShown: Observation.mapApiToRealm( remoteObservation )
      } );
    }
  }, [remoteObservation, isRefetching] );

  const { refetch: refetchObservationUpdates } = useObservationsUpdates(
    !!currentUser && !!observation
  );

  const showErrorAlert = error => Alert.alert( "Error", error, [{ text: t( "OK" ) }], {
    cancelable: true
  } );

  const openAddCommentSheet = ( { isOptional = false } ) => {
    dispatch( {
      type: SET_ADD_COMMENT_SHEET,
      showAddCommentSheet: true,
      commentIsOptional: isOptional || false
    } );
  };

  const hideAddCommentSheet = ( ) => dispatch( {
    type: SET_ADD_COMMENT_SHEET,
    showAddCommentSheet: false,
    comment: null
  } );

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

  const onCommentAdded = body => {
    dispatch( { type: "LOADING_ACTIVITY_ITEM" } );
    createCommentMutation.mutate( {
      comment: {
        body,
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
            dispatch( { type: CLEAR_SUGGESTED_TAXON } );
          }
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

  useEffect( () => {
    if ( !identTaxon ) return;
    if ( showPotentialDisagreementSheet ) return;
    if ( showSuggestIdSheet ) return;
    if ( identBodySheetShown ) return;
    let observationTaxon = observation.taxon;
    if (
      observation.prefers_community_taxon === false
      || ( observation.user?.prefers_community_taxa === false
      && observation.prefers_community_taxon === null )
    ) {
      observationTaxon = observation.community_taxon || observation.taxon;
    }
    dispatch( {
      type: SET_NEW_IDENTIFICATION,
      taxon: identTaxon,
      vision: identTaxonFromVision
    } );
    if (
      observationTaxon
      && identTaxon.id !== observationTaxon.id
      && observationTaxon.ancestor_ids.includes( identTaxon.id )
    ) {
      dispatch( { type: "SHOW_POTENTIAL_DISAGREEMENT_SHEET" } );
    } else {
      dispatch( { type: CONFIRM_ID } );
    }
  }, [
    identAt,
    identBodySheetShown,
    showSuggestIdSheet,
    showPotentialDisagreementSheet,
    identTaxon,
    identTaxonFromVision,
    observation?.community_taxon,
    observation?.taxon,
    observation?.prefers_community_taxon,
    observation?.user?.prefers_community_taxa
  ] );

  const navToSuggestions = ( ) => {
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
  };

  const invalidateQueryAndRefetch = ( ) => {
    invalidateRemoteObservationFetch( );
    refetchRemoteObservation( );
    refetchObservationUpdates( );
  };

  const closeAgreeWithIdSheet = ( ) => {
    dispatch( {
      type: HIDE_AGREE_SHEET
    } );
  };

  const onAgree = ident => {
    const agreeParams = {
      observation_id: observation?.uuid,
      taxon_id: ident.taxon?.id,
      body: ident.body
    };

    dispatch( { type: "LOADING_ACTIVITY_ITEM" } );
    createIdentificationMutation.mutate( { identification: agreeParams } );
    closeAgreeWithIdSheet( );
  };

  const openAgreeWithIdSheet = taxon => {
    dispatch( {
      type: SHOW_AGREE_SHEET,
      newIdentification: { taxon }
    } );
  };
  const potentialDisagreeSheetDiscardChanges = ( ) => {
    dispatch( { type: HIDE_POTENTIAL_DISAGREEMENT_SHEET } );
  };

  const doSuggestId = useCallback( potentialDisagree => {
    if ( !newIdentification?.taxon ) {
      throw new Error( "Cannot create an identification without a taxon" );
    }
    // New taxon identification added by user
    const idParams = {
      observation_id: uuid,
      taxon_id: newIdentification.taxon.id,
      vision: newIdentification.vision,
      disagreement: potentialDisagree,
      body: newIdentification?.body
    };

    dispatch( { type: "LOADING_ACTIVITY_ITEM" } );
    createIdentificationMutation.mutate( { identification: idParams } );
  }, [createIdentificationMutation, newIdentification, uuid] );

  const onSuggestId = useCallback( ( ) => {
    // based on disagreement code in iNat web
    // https://github.com/inaturalist/inaturalist/blob/30a27d0eb79dd17af38292785b0137e6024bbdb7/app/webpack/observations/show/ducks/observation.js#L827-L838
    let observationTaxon = observation?.taxon;
    if (
      observation?.prefers_community_taxon === false
      || (
        observation?.user?.prefers_community_taxa === false
        && observation?.prefers_community_taxon === null
      )
    ) {
      observationTaxon = observation?.community_taxon || observation.taxon;
    }
    if (
      observationTaxon
      && identTaxon?.id !== observationTaxon.id
      && observationTaxon.ancestor_ids.includes( identTaxon?.id )
    ) {
      dispatch( { type: "SHOW_POTENTIAL_DISAGREEMENT_SHEET" } );
    } else {
      doSuggestId();
    }
  }, [
    doSuggestId,
    observation?.community_taxon,
    observation?.prefers_community_taxon,
    observation?.taxon,
    observation?.user?.prefers_community_taxa,
    identTaxon
  ] );

  const onPotentialDisagreePressed = potentialDisagree => {
    dispatch( {
      type: "SHOW_POTENTIAL_DISAGREEMENT_SHEET",
      showPotentialDisagreementSheet: false
    } );
    doSuggestId( potentialDisagree );
  };

  const suggestIdSheetDiscardChanges = ( ) => dispatch( { type: DISCARD_ID } );

  const confirmCommentFromCommentSheet = newComment => {
    if ( !commentIsOptional ) {
      onCommentAdded( newComment );
    }
  };

  return observationShown && (
    <ObsDetailsDefaultMode
      activityItems={activityItems || []}
      addingActivityItem={addingActivityItem}
      closeAgreeWithIdSheet={closeAgreeWithIdSheet}
      belongsToCurrentUser={belongsToCurrentUser}
      comment={comment}
      commentIsOptional={commentIsOptional}
      confirmCommentFromCommentSheet={confirmCommentFromCommentSheet}
      confirmRemoteObsWasDeleted={confirmRemoteObsWasDeleted}
      currentUser={currentUser}
      editIdentBody={( ) => dispatch( { type: SHOW_EDIT_IDENT_BODY_SHEET } )}
      onPotentialDisagreePressed={onPotentialDisagreePressed}
      hideAddCommentSheet={hideAddCommentSheet}
      isConnected={isConnected}
      navToSuggestions={navToSuggestions}
      targetActivityItemID={targetActivityItemID}
      // saving observation in state (i.e. using observationShown)
      // limits the number of rerenders to entire obs details tree
      observation={observationShown}
      onAgree={onAgree}
      openAgreeWithIdSheet={openAgreeWithIdSheet}
      onSuggestId={onSuggestId}
      openAddCommentSheet={openAddCommentSheet}
      potentialDisagreeSheetDiscardChanges={potentialDisagreeSheetDiscardChanges}
      refetchRemoteObservation={invalidateQueryAndRefetch}
      remoteObsWasDeleted={remoteObsWasDeleted}
      showAgreeWithIdSheet={!!showAgreeWithIdSheet}
      showAddCommentSheet={showAddCommentSheet}
      showSuggestIdSheet={!!showSuggestIdSheet}
      refetchSubscriptions={refetchSubscriptions}
      subscriptions={!belongsToCurrentUser
        ? subscriptions?.results
        : []}
      suggestIdSheetDiscardChanges={suggestIdSheetDiscardChanges}
      showPotentialDisagreementSheet={showPotentialDisagreementSheet}
      identBodySheetShown={identBodySheetShown}
      newIdentification={newIdentification}
      onChangeIdentBody={body => dispatch( {
        type: SET_NEW_IDENTIFICATION,
        taxon: newIdentification?.taxon,
        body
      } )}
      onCloseIdentBodySheet={() => {
        dispatch( { type: HIDE_EDIT_IDENT_BODY_SHEET } );
      }}
      uuid={uuid}
    />
  );
};

export default ObsDetailsContainer;
