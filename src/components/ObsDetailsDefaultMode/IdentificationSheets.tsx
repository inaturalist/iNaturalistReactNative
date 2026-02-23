import type { ParamListBase } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { createComment } from "api/comments";
import { createIdentification } from "api/identifications";
import AgreeWithIDSheet from "components/ObsDetailsSharedComponents/Sheets/AgreeWithIDSheet";
import PotentialDisagreementSheet
  from "components/ObsDetailsSharedComponents/Sheets/PotentialDisagreementSheet";
import SuggestIDSheet from "components/ObsDetailsSharedComponents/Sheets/SuggestIDSheet";
import {
  TextInputSheet,
  WarningSheet,
} from "components/SharedComponents";
import { RealmContext } from "providers/contexts";
import React, {
  useCallback,
  useEffect,
  useReducer,
} from "react";
import { Alert, Platform } from "react-native";
import fetchTaxonAndSave from "sharedHelpers/fetchTaxonAndSave";
import {
  useAuthenticatedMutation,
  useTranslation,
} from "sharedHooks";

const { useRealm } = RealmContext;

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
  comment: string | null;
  commentIsOptional: boolean;
  showIdentBodySheet: boolean;
  newIdentification: Identification | null;
  showPotentialDisagreementSheet: boolean;
  showSuggestIdSheet: boolean;
  identTaxon?: Taxon | null;
}

type IdentAction =
  | { type: "CLEAR_SUGGESTED_TAXON" }
  | { type: "CONFIRM_ID" }
  | { type: "HIDE_EDIT_IDENT_BODY_SHEET" }
  | { type: "HIDE_POTENTIAL_DISAGREEMENT_SHEET" }
  | { type: "SET_NEW_IDENTIFICATION"; taxon?: Taxon; body?: string; vision?: boolean }
  | { type: "SHOW_EDIT_IDENT_BODY_SHEET" }
  | { type: "SHOW_POTENTIAL_DISAGREEMENT_SHEET" }
  | { type: "SUBMIT_IDENTIFICATION" }
  | { type: "HIDE_SUGGESTED_ID_SHEET" };

const initialIdentState: IdentState = {
  comment: null,
  commentIsOptional: false,
  showIdentBodySheet: false,
  newIdentification: null,
  showPotentialDisagreementSheet: false,
  showSuggestIdSheet: false,
  identTaxon: null,
};

const CLEAR_SUGGESTED_TAXON = "CLEAR_SUGGESTED_TAXON";
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
        identTaxon: action.taxon,
      };
    case CONFIRM_ID:
      return { ...state, showSuggestIdSheet: true };
    case HIDE_POTENTIAL_DISAGREEMENT_SHEET:
      return {
        ...state,
        showPotentialDisagreementSheet: false,
        identTaxon: null,
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
        identTaxon: null,
      };
    case CLEAR_SUGGESTED_TAXON:
      return { ...state, identTaxon: null };
    case HIDE_SUGGESTED_ID_SHEET:
      return { ...state, showSuggestIdSheet: false };
    default:
      return state;
  }
};

interface RouteParams extends Record<string, unknown> {
  identAt?: string;
  identTaxonId?: number;
  identTaxonFromVision?: boolean;
  uuid?: string;
}

interface Props {
  agreeIdentification: boolean;
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
  const { params } = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const routeParams = params as RouteParams;
  const {
    identAt,
    identTaxonId,
    identTaxonFromVision,
    uuid,
  } = routeParams;
  const [state, dispatch] = useReducer( identReducer, initialIdentState );

  const {
    comment,
    commentIsOptional,
    showIdentBodySheet,
    identTaxon,
    newIdentification,
    showPotentialDisagreementSheet,
    showSuggestIdSheet,
  } = state;

  const realm = useRealm( );
  const { t } = useTranslation( );

  const hasComment = ( comment || newIdentification?.body || "" ).length > 0;

  const showAddCommentHeader = useCallback( ( ) => {
    if ( hasComment ) {
      return t( "EDIT-COMMENT" );
    } if ( commentIsOptional ) {
      return t( "ADD-OPTIONAL-COMMENT" );
    }
    return t( "ADD-COMMENT" );
  }, [commentIsOptional, hasComment, t] );

  const editIdentBody = useCallback( ( ) => dispatch( { type: SHOW_EDIT_IDENT_BODY_SHEET } ), [] );

  const onChangeIdentBody = useCallback( ( body: string ) => dispatch( {
    type: SET_NEW_IDENTIFICATION,
    taxon: newIdentification?.taxon,
    body,
  } ), [newIdentification?.taxon] );

  const onCloseIdentBodySheet = useCallback( ( ) => {
    dispatch( { type: HIDE_EDIT_IDENT_BODY_SHEET } );
  }, [] );

  const showErrorAlert = useCallback( error => Alert.alert( "Error", error, [{ text: t( "OK" ) }], {
    cancelable: true,
  } ), [t] );

  const { mutate: createIdentificationMutate } = useAuthenticatedMutation(
    ( idParams, optsWithAuth ) => createIdentification( idParams, optsWithAuth ),
    {
      onSuccess: data => {
        handleIdentificationMutationSuccess( data );
        if ( uuid ) {
          dispatch( { type: CLEAR_SUGGESTED_TAXON } );
        }
      },
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
        // Clear params gotten via useRoute to prevent re-showing sheets
        navigation.setParams(
          { identAt: undefined, identTaxonId: undefined, identTaxonFromVision: undefined },
        );
      },
    },
  );

  const hasPotentialDisagreement = useCallback( ( taxon: Taxon | null | undefined ) => {
    // based on disagreement code in iNat web
    // https://github.com/inaturalist/inaturalist/blob/30a27d0eb79dd17af38292785b0137e6024bbdb7/app/webpack/observations/show/ducks/observation.js#L827-L838
    let observationTaxon = observation?.taxon;

    const doesNotPreferCommunityTaxon = observation.prefers_community_taxon === false
      || ( observation.user?.prefers_community_taxa === false
      && observation.prefers_community_taxon === null );

    if ( doesNotPreferCommunityTaxon ) {
      observationTaxon = observation?.community_taxon || observation.taxon;
    }
    return observationTaxon
        && taxon?.id !== observationTaxon.id
        && observationTaxon.ancestor_ids.includes( taxon?.id );
  }, [observation] );

  // Translates identification-related params to local state and shows appropriate sheet
  useEffect( ( ) => {
    let cancelled = false;

    async function handleIdentificationNavigation() {
      if ( !identTaxonId ) {
        dispatch( { type: CLEAR_SUGGESTED_TAXON } );
        return;
      }

      let taxon = realm.objectForPrimaryKey( "Taxon", identTaxonId );
      if ( !taxon ) {
        taxon = await fetchTaxonAndSave( identTaxonId, realm );
      }

      if ( cancelled ) return;

      dispatch( {
        type: SET_NEW_IDENTIFICATION,
        taxon,
        vision: identTaxonFromVision,
      } );

      const isDisagreement = hasPotentialDisagreement( taxon );

      if ( isDisagreement ) {
        dispatch( { type: "SHOW_POTENTIAL_DISAGREEMENT_SHEET" } );
      } else {
        dispatch( { type: CONFIRM_ID } );
      }
    }

    handleIdentificationNavigation();

    return () => {
      cancelled = true;
    };
  }, [
    // This should change with every new navigation event back to ObsDetails,
    // so even if identTaxonId doesn't change, e.g. you add an ID of taxon X,
    // cancel, then add another ID of taxon X, we still update the identTaxon
    identAt,
    identTaxonId,
    identTaxonFromVision,
    hasPotentialDisagreement,
    realm,
  ] );

  const onAgree = useCallback( ( ident: Identification ) => {
    const agreeParams = {
      observation_id: observation?.uuid,
      taxon_id: ident.taxon?.id,
      body: ident.body,
    };

    loadActivityItem( );
    createIdentificationMutate( { identification: agreeParams } );
    closeAgreeWithIdSheet( );
  }, [closeAgreeWithIdSheet, createIdentificationMutate, observation?.uuid, loadActivityItem] );

  const potentialDisagreeSheetDiscardChanges = useCallback( ( ) => {
    dispatch( { type: HIDE_POTENTIAL_DISAGREEMENT_SHEET } );
  }, [] );

  const doSuggestId = useCallback( ( potentialDisagree?: boolean ) => {
    dispatch( { type: SUBMIT_IDENTIFICATION } );

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

  const onSuggestId = useCallback( ( ) => {
    if ( hasPotentialDisagreement( identTaxon ) ) {
      dispatch( { type: "SHOW_POTENTIAL_DISAGREEMENT_SHEET" } );
    } else {
      doSuggestId();
    }
  }, [
    doSuggestId,
    hasPotentialDisagreement,
    identTaxon,
  ] );

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
    if ( !commentIsOptional ) {
      onCommentAdded( newComment );
    }
  }, [commentIsOptional, onCommentAdded] );

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
          onPressClose={closeAgreeWithIdSheet}
          identification={agreeIdentification}
        />
      )}
      {/* AddCommentSheet */}
      {showAddCommentSheet && (
        <TextInputSheet
          buttonText={t( "CONFIRM" )}
          onPressClose={hideAddCommentSheet}
          headerText={addCommentHeaderText}
          textInputStyle={textInputStyle}
          initialInput={comment}
          confirm={confirmCommentFromCommentSheet}
        />
      )}
      {/* Sheet for adding comment w/ ID */}
      {showIdentBodySheet && (
        <TextInputSheet
          buttonText={t( "CONFIRM" )}
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
          onSuggestId={onSuggestId}
          identification={newIdentification}
          onPressClose={hideSuggestedIdSheet}
        />
      )}
      {showPotentialDisagreementSheet && newIdentification && (
        <PotentialDisagreementSheet
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
        />
      ) }
    </>
  );
};

export default IdentificationSheets;
