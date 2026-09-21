import { useRoute } from "@react-navigation/native";
import { createComment } from "api/comments";
import { createIdentification } from "api/identifications";
import type {
  AgreeIdentification,
} from "components/ObsDetailsSharedComponents/hooks/useObsDetailsSharedLogic";
import AgreeWithIDSheet from "components/ObsDetailsSharedComponents/Sheets/AgreeWithIDSheet";
import PotentialDisagreementSheet
  from "components/ObsDetailsSharedComponents/Sheets/PotentialDisagreementSheet";
import SuggestIDSheet from "components/ObsDetailsSharedComponents/Sheets/SuggestIDSheet";
import {
  TextInputSheet,
  WarningSheet,
} from "components/SharedComponents";
import type { TabStackScreenProps } from "navigation/types";
import { RealmContext } from "providers/contexts";
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { Alert, Platform } from "react-native";
import fetchTaxonAndSave from "sharedHelpers/fetchTaxonAndSave";
import { log } from "sharedHelpers/logger";
import {
  useAuthenticatedMutation,
  useRouteEvent,
  useTranslation,
} from "sharedHooks";

const { useRealm } = RealmContext;

const logger = log.extend( "IdentificationSheets" );

type ObsDetailsParams = TabStackScreenProps<"ObsDetails">["route"]["params"];

// These params say "the user just picked a taxon", not "this screen is showing
// a taxon", so they are consumed once and cleared. See useRouteEvent.
const IDENT_EVENT_KEYS = [
  "identAt",
  "identTaxonId",
  "identTaxonFromVision",
] as const satisfies readonly ( keyof ObsDetailsParams )[];

const textInputStyle = Platform.OS === "android"
  ? {
    height: 125,
  }
  : undefined;

interface Taxon extends Record<string, unknown> {
  id: number;
  ancestor_ids: number[];
}

interface Observation extends Record<string, unknown> {
  uuid?: string;
  taxon?: Taxon;
  community_taxon?: Taxon;
  prefers_community_taxon: boolean | null;
  user?: {
    prefers_community_taxa: boolean;
  };
}

interface Identification {
  taxon?: Taxon;
  body?: string;
  vision?: boolean;
}

interface IdentState {
  showIdentBodySheet: boolean;
  newIdentification: Identification | null;
  showPotentialDisagreementSheet: boolean;
  showSuggestIdSheet: boolean;
}

type IdentAction =
  | { type: "CONFIRM_ID" }
  | { type: "HIDE_EDIT_IDENT_BODY_SHEET" }
  | { type: "HIDE_POTENTIAL_DISAGREEMENT_SHEET" }
  | { type: "SET_NEW_IDENTIFICATION"; taxon?: Taxon; body?: string; vision?: boolean }
  | { type: "SHOW_EDIT_IDENT_BODY_SHEET" }
  | { type: "SHOW_POTENTIAL_DISAGREEMENT_SHEET" }
  | { type: "SUBMIT_IDENTIFICATION" }
  | { type: "HIDE_SUGGESTED_ID_SHEET" };

const initialIdentState: IdentState = {
  showIdentBodySheet: false,
  newIdentification: null,
  showPotentialDisagreementSheet: false,
  showSuggestIdSheet: false,
};

const CONFIRM_ID = "CONFIRM_ID";
const HIDE_EDIT_IDENT_BODY_SHEET = "HIDE_EDIT_IDENT_BODY_SHEET";
const HIDE_POTENTIAL_DISAGREEMENT_SHEET = "HIDE_POTENTIAL_DISAGREEMENT_SHEET";
const SET_NEW_IDENTIFICATION = "SET_NEW_IDENTIFICATION";
const SHOW_EDIT_IDENT_BODY_SHEET = "SHOW_EDIT_IDENT_BODY_SHEET";
const SHOW_POTENTIAL_DISAGREEMENT_SHEET = "SHOW_POTENTIAL_DISAGREEMENT_SHEET";
const SUBMIT_IDENTIFICATION = "SUBMIT_IDENTIFICATION";
const HIDE_SUGGESTED_ID_SHEET = "HIDE_SUGGESTED_ID_SHEET";

export const identReducer = ( state: IdentState, action: IdentAction ): IdentState => {
  switch ( action.type ) {
    case SHOW_POTENTIAL_DISAGREEMENT_SHEET:
      return {
        ...state,
        showPotentialDisagreementSheet: true,
      };
    case SET_NEW_IDENTIFICATION:
      return {
        ...state,
        newIdentification: {
          taxon: action.taxon,
          body: action.body,
          vision: action.vision,
        },
      };
    case CONFIRM_ID:
      return { ...state, showSuggestIdSheet: true };
    case HIDE_POTENTIAL_DISAGREEMENT_SHEET:
      return {
        ...state,
        showPotentialDisagreementSheet: false,
        newIdentification: null,
      };
    case SHOW_EDIT_IDENT_BODY_SHEET:
      return {
        ...state,
        showIdentBodySheet: true,
      };
    case HIDE_EDIT_IDENT_BODY_SHEET:
      return {
        ...state,
        showIdentBodySheet: false,
      };
    case SUBMIT_IDENTIFICATION:
      return {
        ...state,
        showPotentialDisagreementSheet: false,
        showSuggestIdSheet: false,
        showIdentBodySheet: false,
        newIdentification: null,
      };
    case HIDE_SUGGESTED_ID_SHEET:
      return {
        ...state,
        showSuggestIdSheet: false,
        newIdentification: null,
      };
    default:
      return state;
  }
};

interface Props {
  agreeIdentification: AgreeIdentification | null;
  closeAgreeWithIdSheet: () => void;
  confirmRemoteObsWasDeleted?: () => void;
  handleCommentMutationSuccess: ( data: unknown ) => void;
  handleIdentificationMutationSuccess: ( data: unknown ) => void;
  hideAddCommentSheet: () => void;
  loadActivityItem: () => void;
  observation: Observation;
  remoteObsWasDeleted?: boolean;
  showAddCommentSheet?: boolean;
  showAgreeWithIdSheet: boolean;
}

const IdentificationSheets: React.FC<Props> = ( {
  agreeIdentification,
  closeAgreeWithIdSheet,
  confirmRemoteObsWasDeleted,
  handleCommentMutationSuccess,
  handleIdentificationMutationSuccess,
  hideAddCommentSheet,
  loadActivityItem,
  observation,
  remoteObsWasDeleted,
  showAddCommentSheet,
  showAgreeWithIdSheet,
}: Props ) => {
  const { params } = useRoute<TabStackScreenProps<"ObsDetails">["route"]>( );
  const { uuid } = params;
  const [state, dispatch] = useReducer( identReducer, initialIdentState );

  const {
    showIdentBodySheet,
    newIdentification,
    showPotentialDisagreementSheet,
    showSuggestIdSheet,
  } = state;

  const realm = useRealm( );
  const { t } = useTranslation( );

  const hasComment = ( newIdentification?.body || "" ).length > 0;

  const showAddCommentHeader = useCallback( ( ) => (
    hasComment
      ? t( "EDIT-COMMENT" )
      : t( "ADD-COMMENT" )
  ), [hasComment, t] );

  const editIdentBody = useCallback( ( ) => dispatch( { type: SHOW_EDIT_IDENT_BODY_SHEET } ), [] );

  const onChangeIdentBody = useCallback( ( body: string ) => dispatch( {
    type: SET_NEW_IDENTIFICATION,
    taxon: newIdentification?.taxon || agreeIdentification?.taxon,
    body,
  } ), [newIdentification?.taxon, agreeIdentification?.taxon] );

  const onCloseIdentBodySheet = useCallback( ( ) => {
    dispatch( { type: HIDE_EDIT_IDENT_BODY_SHEET } );
  }, [] );

  const showErrorAlert
  = useCallback( ( error: string ) => Alert.alert( "Error", error, [{ text: t( "OK" ) }], {
    cancelable: true,
  } ), [t] );

  const {
    mutate: createIdentificationMutate,
    isPending: isCreateIdPending,
  } = useAuthenticatedMutation(
    ( idParams, optsWithAuth ) => createIdentification( idParams, optsWithAuth ),
    {
      onSuccess: data => handleIdentificationMutationSuccess( data ),
      onError: ( e: Error ) => {
        let error = null;
        if ( e ) {
          error = t( "Couldnt-create-identification-error", { error: e.message } );
        } else {
          error = t( "Couldnt-create-identification-unknown-error" );
        }
        showErrorAlert( error );
      },
      onSettled: () => {
        dispatch( { type: SUBMIT_IDENTIFICATION } );
        closeAgreeWithIdSheet( );
      },
    },
  );

  const hasPotentialDisagreement = useCallback( ( taxon: Taxon | null | undefined ) => {
    // based on disagreement code in iNat web
    // https://github.com/inaturalist/inaturalist/blob/30a27d0eb79dd17af38292785b0137e6024bbdb7/app/webpack/observations/show/ducks/observation.js#L827-L838
    let observationTaxon = observation.taxon;

    const doesNotPreferCommunityTaxon = observation.prefers_community_taxon === false
      || ( observation.user?.prefers_community_taxa === false
      && observation.prefers_community_taxon === null );

    if ( doesNotPreferCommunityTaxon ) {
      observationTaxon = observation.community_taxon || observation.taxon;
    }
    return observationTaxon
        && !!taxon?.id
        && taxon?.id !== observationTaxon.id
        && observationTaxon.ancestor_ids.includes( taxon?.id );
  }, [observation] );

  // Read through a ref so this effect does not depend on the observation.
  // hasPotentialDisagreement is rebuilt whenever `observation` is replaced,
  // which happens on every remote refetch, and this effect starts the whole
  // flow -- so depending on it restarted the flow on an unrelated refetch.
  const hasPotentialDisagreementRef = useRef( hasPotentialDisagreement );
  useEffect( ( ) => {
    hasPotentialDisagreementRef.current = hasPotentialDisagreement;
  }, [hasPotentialDisagreement] );

  // Fetching the taxon is async, so two navigation events in quick succession
  // can have their fetches resolve out of order. Each event takes an id and
  // only the latest may act, so a stale one neither dispatches nor complains.
  const latestFlowId = useRef( 0 );

  // Unmounting invalidates whatever is in flight, by the same rule
  useEffect( ( ) => ( ) => {
    latestFlowId.current += 1;
  }, [] );

  // Translates an identification navigation event into local state and shows
  // the appropriate sheet. The params are cleared on delivery, so this cannot
  // re-run and restart a flow the user has already finished or dismissed.
  const onIdentificationEvent = useCallback( ( event: Partial<ObsDetailsParams> ) => {
    const { identTaxonId, identTaxonFromVision } = event;
    if ( !identTaxonId ) return;

    latestFlowId.current += 1;
    const flowId = latestFlowId.current;

    const startFlow = async ( ) => {
      let taxon = realm.objectForPrimaryKey( "Taxon", identTaxonId );
      if ( !taxon ) {
        taxon = await fetchTaxonAndSave( identTaxonId, realm );
      }
      if ( flowId !== latestFlowId.current ) return;

      // Decided once, here. Re-deriving it when the user presses the button
      // can give a different answer, because the observation it comes from is
      // replaced on every remote refetch.
      const isDisagreement = !!hasPotentialDisagreementRef.current( taxon );

      dispatch( {
        type: SET_NEW_IDENTIFICATION,
        taxon,
        vision: identTaxonFromVision,
      } );
      dispatch( {
        type: isDisagreement
          ? SHOW_POTENTIAL_DISAGREEMENT_SHEET
          : CONFIRM_ID,
      } );
    };

    startFlow( ).catch( ( e: Error ) => {
      // A superseded or unmounted flow has nothing to report
      if ( flowId !== latestFlowId.current ) return;
      // The params are consumed on delivery, so nothing will retry this for
      // us. Tell the user rather than leaving them looking at no sheet.
      logger.error( "Failed to start identification flow", e );
      showErrorAlert( t( "Something-went-wrong" ) );
    } );
  }, [realm, showErrorAlert, t] );

  useRouteEvent<ObsDetailsParams>( IDENT_EVENT_KEYS, onIdentificationEvent );

  const onAgree = useCallback( ( ident: Identification ) => {
    const agreeParams = {
      observation_id: observation?.uuid,
      taxon_id: ident.taxon?.id,
      body: ident.body,
    };

    loadActivityItem( );
    createIdentificationMutate( { identification: agreeParams } );
  }, [createIdentificationMutate, observation?.uuid, loadActivityItem] );

  const potentialDisagreeSheetDiscardChanges = useCallback( ( ) => {
    dispatch( { type: HIDE_POTENTIAL_DISAGREEMENT_SHEET } );
  }, [] );

  const doSuggestId = useCallback( ( potentialDisagree?: boolean ) => {
    if ( !newIdentification?.taxon ) {
      throw new Error( "Cannot create an identification without a taxon" );
    }
    // New taxon identification added by user
    const idParams = {
      observation_id: uuid,
      taxon_id: newIdentification.taxon.id,
      vision: newIdentification.vision,
      disagreement: potentialDisagree,
      body: newIdentification?.body,
    };

    loadActivityItem( );
    createIdentificationMutate( { identification: idParams } );
  }, [createIdentificationMutate, newIdentification, uuid, loadActivityItem] );

  // No disagreement check here. Whether this identification disagrees is
  // settled when the flow starts, by which sheet gets opened -- the suggest ID
  // sheet only appears when it does not. Re-deriving it on press used to give
  // a different answer, because the observation it comes from is replaced on
  // every remote refetch.
  const onSuggestId = useCallback( ( ) => {
    doSuggestId();
  }, [doSuggestId] );

  const onPotentialDisagreePressed = useCallback( ( potentialDisagree?: boolean ) => {
    doSuggestId( potentialDisagree );
  }, [doSuggestId] );

  const { mutate: createCommentMutate } = useAuthenticatedMutation(
    ( commentParams, optsWithAuth ) => createComment( commentParams, optsWithAuth ),
    {
      onSuccess: data => handleCommentMutationSuccess( data ),
      onError: ( e: Error ) => {
        let error = null;
        if ( e ) {
          error = t( "Couldnt-create-comment", { error: e.message } );
        } else {
          error = t( "Couldnt-create-comment", { error: t( "Unknown-error" ) } );
        }
        showErrorAlert( error );
      },
    },
  );

  const onCommentAdded = useCallback( ( body: string ) => {
    loadActivityItem( );
    createCommentMutate( {
      comment: {
        body,
        parent_id: uuid,
        parent_type: "Observation",
      },
    } );
  }, [createCommentMutate, uuid, loadActivityItem] );

  const confirmCommentFromCommentSheet = useCallback( ( newComment: string ) => {
    onCommentAdded( newComment );
  }, [onCommentAdded] );

  const hideSuggestedIdSheet = ( ) => {
    dispatch( { type: HIDE_SUGGESTED_ID_SHEET } );
  };

  const addCommentHeaderText = showAddCommentHeader( );

  return (
    <>
      {showAgreeWithIdSheet && agreeIdentification && (
        <AgreeWithIDSheet
          onAgree={onAgree}
          editIdentBody={editIdentBody}
          hidden={showIdentBodySheet}
          loading={isCreateIdPending}
          onPressClose={closeAgreeWithIdSheet}
          identification={{
            taxon: agreeIdentification.taxon,
            body: newIdentification?.body,
          }}
        />
      )}
      {/* AddCommentSheet */}
      {showAddCommentSheet && (
        <TextInputSheet
          buttonText={t( "CONFIRM" )}
          mentionsEnabled
          onPressClose={hideAddCommentSheet}
          headerText={addCommentHeaderText}
          textInputStyle={textInputStyle}
          confirm={confirmCommentFromCommentSheet}
        />
      )}
      {/* Sheet for adding comment w/ ID */}
      {showIdentBodySheet && (
        <TextInputSheet
          buttonText={t( "CONFIRM" )}
          mentionsEnabled
          onPressClose={onCloseIdentBodySheet}
          headerText={addCommentHeaderText}
          textInputStyle={textInputStyle}
          initialInput={newIdentification?.body}
          confirm={onChangeIdentBody}
        />
      )}
      {showSuggestIdSheet && (
        <SuggestIDSheet
          editIdentBody={editIdentBody}
          hidden={showIdentBodySheet}
          loading={isCreateIdPending}
          onSuggestId={onSuggestId}
          identification={newIdentification}
          onPressClose={hideSuggestedIdSheet}
        />
      )}
      {showPotentialDisagreementSheet && newIdentification && (
        <PotentialDisagreementSheet
          loading={isCreateIdPending}
          onPotentialDisagreePressed={onPotentialDisagreePressed}
          onPressClose={potentialDisagreeSheetDiscardChanges}
          newTaxon={newIdentification.taxon}
          oldTaxon={observation.taxon}
        />
      )}
      {/*
        * FWIW, some situations in which this could happen are
        * 1. User loaded obs in explore and it was deleted between then and
          when they tapped on it
        * 2. Some process fetched observations between when they were deleted
          and the search index was updated to reflect that
        *
      */}
      { remoteObsWasDeleted && confirmRemoteObsWasDeleted && (
        <WarningSheet
          onPressClose={confirmRemoteObsWasDeleted}
          headerText={t( "OBSERVATION-WAS-DELETED" )}
          text={t( "Sorry-this-observation-was-deleted" )}
          buttonText={t( "OK" )}
          confirm={confirmRemoteObsWasDeleted}
          loading={false}
        />
      ) }
    </>
  );
};

export default IdentificationSheets;
