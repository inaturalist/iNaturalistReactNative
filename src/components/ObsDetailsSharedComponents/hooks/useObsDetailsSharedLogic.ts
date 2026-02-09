import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { fetchSubscriptions } from "api/observations";
import type { ApiComment, ApiIdentification, ApiObservation } from "api/types";
import { RealmContext } from "providers/contexts";
import {
  useCallback,
  useEffect,
  useReducer,
} from "react";
import Observation from "realmModels/Observation";
import type { RealmObservation, RealmTaxon, RealmUser } from "realmModels/types";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  useAuthenticatedQuery,
  useObservationsUpdates,
} from "sharedHooks";
import {
  fetchRemoteObservationKey,
} from "sharedHooks/useRemoteObservation";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

interface ActivityItem {
  created_at: string;
}

const sortItems = (
  ids: ActivityItem[],
  comments: ActivityItem[],
): ActivityItem[] => ids.concat( [...comments] ).sort(
  ( a, b ) => ( new Date( a.created_at ) - new Date( b.created_at ) ),
);

const SHOW_AGREE_SHEET = "SHOW_AGREE_SHEET";
const HIDE_AGREE_SHEET = "HIDE_AGREE_SHEET";
const SET_ADD_COMMENT_SHEET = "SET_ADD_COMMENT_SHEET";
const SET_INITIAL_OBSERVATION = "SET_INITIAL_OBSERVATION";
const ADD_ACTIVITY_ITEM = "ADD_ACTIVITY_ITEM";
const LOADING_ACTIVITY_ITEM = "LOADING_ACTIVITY_ITEM";

interface AgreeIdentification {
  taxon: RealmTaxon;
}

interface State {
  activityItems: ActivityItem[];
  addingActivityItem: boolean;
  agreeIdentification: AgreeIdentification | null;
  observationShown: ApiObservation | null;
  showAddCommentSheet: boolean;
  showAgreeWithIdSheet: boolean;
}

type Action =
  | { type: typeof SET_INITIAL_OBSERVATION; observationShown: ApiObservation }
  | { type: typeof ADD_ACTIVITY_ITEM; observationShown: ApiObservation }
  | { type: typeof LOADING_ACTIVITY_ITEM }
  | { type: typeof SHOW_AGREE_SHEET; agreeIdentification: AgreeIdentification }
  | { type: typeof HIDE_AGREE_SHEET }
  | { type: typeof SET_ADD_COMMENT_SHEET; showAddCommentSheet: boolean };

const initialState: State = {
  activityItems: [],
  addingActivityItem: false,
  agreeIdentification: null,
  observationShown: null,
  showAddCommentSheet: false,
  showAgreeWithIdSheet: false,
};

const logger = log.extend( "useObsDetailsSharedLogic" );

const reducer = ( state: State, action: Action ): State => {
  switch ( action.type ) {
    case SET_INITIAL_OBSERVATION:
      return {
        ...state,
        observationShown: action.observationShown,
        activityItems: sortItems(
          action.observationShown?.identifications || [],
          action.observationShown?.comments || [],
        ),
      };
    case ADD_ACTIVITY_ITEM:
      return {
        ...state,
        observationShown: action.observationShown,
        addingActivityItem: false,
        activityItems: sortItems(
          action.observationShown?.identifications || [],
          action.observationShown?.comments || [],
        ),
      };
    case LOADING_ACTIVITY_ITEM:
      return {
        ...state,
        addingActivityItem: true,
      };
    case SHOW_AGREE_SHEET:
      return {
        ...state,
        showAgreeWithIdSheet: true,
        agreeIdentification: action.agreeIdentification,
      };
    case HIDE_AGREE_SHEET:
      return {
        ...state,
        showAgreeWithIdSheet: false,
        agreeIdentification: null,
      };
    case SET_ADD_COMMENT_SHEET:
      return {
        ...state,
        showAddCommentSheet: action.showAddCommentSheet,
      };
    default:
      logger.error( "Unknown action in useObsDetailsSharedLogic reducer: ", action );
      return state;
  }
};

interface UseObsDetailsSharedLogicParams {
  observation: RealmObservation;
  uuid: string;
  localObservation: RealmObservation | null;
  remoteObservation: RealmObservation | null;
  markViewedLocally: ( ) => void;
  markDeletedLocally: ( ) => void;
  setRemoteObsWasDeleted: ( deleted: boolean ) => void;
  fetchRemoteObservationError: { status?: number } | null;
  currentUser: RealmUser | null;
  belongsToCurrentUser: boolean;
  isRefetching: boolean;
  refetchRemoteObservation: ( ) => void;
}

interface UseObsDetailsSharedLogicReturn {
  // State
  activityItems: ActivityItem[];
  addingActivityItem: boolean;
  agreeIdentification: AgreeIdentification | null;
  observationShown: RealmObservation | null;
  showAddCommentSheet: boolean;
  showAgreeWithIdSheet: boolean;

  // Computed
  subscriptionResults: unknown[];
  wasSynced: boolean;

  // Callbacks
  openAddCommentSheet: () => void;
  hideAddCommentSheet: () => void;
  openAgreeWithIdSheet: ( taxon: RealmTaxon ) => void;
  closeAgreeWithIdSheet: () => void;
  navToSuggestions: () => void;
  invalidateQueryAndRefetch: () => void;
  handleIdentificationMutationSuccess: ( data: ApiIdentification[] ) => void;
  handleCommentMutationSuccess: ( data: ApiComment[] ) => void;
  confirmRemoteObsWasDeleted: () => void;
  loadActivityItem: () => void;
  refetchSubscriptions: () => void;
}

const useObsDetailsSharedLogic = ( {
  observation,
  uuid,
  localObservation,
  markDeletedLocally,
  remoteObservation,
  setRemoteObsWasDeleted,
  fetchRemoteObservationError,
  currentUser,
  belongsToCurrentUser,
  isRefetching,
  refetchRemoteObservation,
}: UseObsDetailsSharedLogicParams ): UseObsDetailsSharedLogicReturn => {
  const setObservations = useStore( state => state.setObservations );
  const navigation = useNavigation<NavigationProp<ParamListBase>>( );
  const realm = useRealm( );
  const [state, dispatch] = useReducer( reducer, initialState );
  const queryClient = useQueryClient( );

  const {
    activityItems,
    addingActivityItem,
    agreeIdentification,
    observationShown,
    showAddCommentSheet,
    showAgreeWithIdSheet,
  } = state;

  // If we tried to get a remote observation but it no longer exists, the user
  // can't do anything so we need to send them back and remove the local
  // copy of this observation
  useEffect( ( ) => {
    setRemoteObsWasDeleted( fetchRemoteObservationError?.status === 404 );
  }, [fetchRemoteObservationError?.status, setRemoteObsWasDeleted] );

  const confirmRemoteObsWasDeleted = useCallback( ( ) => {
    if ( localObservation ) {
      markDeletedLocally( );
    }
    if ( navigation.canGoBack( ) ) navigation.goBack( );
  }, [
    localObservation,
    markDeletedLocally,
    navigation,
  ] );

  const wasSynced = !!( localObservation && localObservation?.wasSynced() );

  const hasPhotos = observation?.observationPhotos?.length > 0;

  const { data: subscriptions, refetch: refetchSubscriptions } = useAuthenticatedQuery(
    [
      "fetchSubscriptions",
    ],
    optsWithAuth => fetchSubscriptions( { uuid, fields: "user_id" }, optsWithAuth ),
    {
      enabled: !!( currentUser ) && !belongsToCurrentUser,
    },
  );

  const invalidateRemoteObservationFetch = useCallback( ( ) => {
    if ( observation?.uuid ) {
      queryClient.invalidateQueries( {
        queryKey: [fetchRemoteObservationKey, observation.uuid],
      } );
    }
  }, [queryClient, observation?.uuid] );

  useFocusEffect(
    // this ensures activity items load after a user taps suggest id
    // and adds a remote id on the Suggestions screen
    useCallback( ( ) => {
      invalidateRemoteObservationFetch( );
    }, [invalidateRemoteObservationFetch] ),
  );

  useEffect( ( ) => {
    if ( !observationShown ) {
      dispatch( {
        type: SET_INITIAL_OBSERVATION,
        observationShown: observation,
      } );
    }
  }, [observation, observationShown] );

  useEffect( ( ) => {
    // if observation does not belong to current user, show
    // new activity items after a refetch
    if ( remoteObservation && !isRefetching ) {
      dispatch( {
        type: ADD_ACTIVITY_ITEM,
        observationShown: Observation.mapApiToRealm( remoteObservation ),
      } );
    }
  }, [remoteObservation, isRefetching] );

  const { refetch: refetchObservationUpdates } = useObservationsUpdates(
    !!currentUser && !!observation,
  );

  const openAddCommentSheet = useCallback( ( ) => {
    dispatch( {
      type: SET_ADD_COMMENT_SHEET,
      showAddCommentSheet: true,
    } );
  }, [] );

  const hideAddCommentSheet = useCallback( ( ) => dispatch( {
    type: SET_ADD_COMMENT_SHEET,
    showAddCommentSheet: false,
  } ), [] );

  const openAgreeWithIdSheet = useCallback( ( taxon: RealmTaxon ) => {
    dispatch( {
      type: SHOW_AGREE_SHEET,
      agreeIdentification: { taxon },
    } );
  }, [] );

  const navToSuggestions = useCallback( ( ) => {
    setObservations( [observation] );
    if ( hasPhotos ) {
      navigation.push( "Suggestions", {
        entryScreen: "ObsDetails",
        lastScreen: "ObsDetails",
        hideSkip: true,
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

  const handleIdentificationMutationSuccess = useCallback( ( data: ApiIdentification[] ) => {
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
        dispatch( { type: ADD_ACTIVITY_ITEM, observationShown: updatedLocalObservation } );
      }
    }
  }, [
    belongsToCurrentUser,
    currentUser,
    localObservation?.identifications,
    realm,
    refetchRemoteObservation,
    uuid,
  ] );

  const handleCommentMutationSuccess = useCallback( ( data: ApiComment[] ) => {
    refetchRemoteObservation( );
    if ( belongsToCurrentUser ) {
      safeRealmWrite( realm, ( ) => {
        const localComments = localObservation?.comments;
        const newComment = data[0];
        newComment.user = currentUser;
        localComments?.push( newComment );
      }, "setting local comment in ObsDetailsContainer" );
      const updatedLocalObservation = realm.objectForPrimaryKey( "Observation", uuid );
      dispatch( { type: ADD_ACTIVITY_ITEM, observationShown: updatedLocalObservation } );
    }
  }, [
    belongsToCurrentUser,
    currentUser,
    localObservation?.comments,
    realm,
    refetchRemoteObservation,
    uuid,
  ] );

  const closeAgreeWithIdSheet = useCallback( ( ) => {
    dispatch( { type: HIDE_AGREE_SHEET } );
  }, [] );

  const loadActivityItem = useCallback( ( ) => {
    dispatch( { type: LOADING_ACTIVITY_ITEM } );
  }, [] );

  return {
    // State
    activityItems,
    addingActivityItem,
    agreeIdentification,
    observationShown,
    showAddCommentSheet,
    showAgreeWithIdSheet,

    // Computed
    subscriptionResults,
    wasSynced,

    // Callbacks
    openAddCommentSheet,
    hideAddCommentSheet,
    openAgreeWithIdSheet,
    closeAgreeWithIdSheet,
    navToSuggestions,
    invalidateQueryAndRefetch,
    handleIdentificationMutationSuccess,
    handleCommentMutationSuccess,
    confirmRemoteObsWasDeleted,
    loadActivityItem,
    refetchSubscriptions,
  };
};

export default useObsDetailsSharedLogic;
