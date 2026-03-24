import {
  useNetInfo,
} from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import scoreImage from "api/computerVision";
import i18n from "i18next";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect, useState,
} from "react";
import { UpdateMode } from "realm";
import Taxon from "realmModels/Taxon";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { logFirebaseEvent } from "sharedHelpers/tracking";
import {
  useAuthenticatedQuery,
  useCurrentUser,
} from "sharedHooks";
import useStore from "stores/useStore";
import { v4 as uuidv4 } from "uuid";

import type { ScoreImageParams, UseSuggestionsOnlineSuggestion } from "./types";
import type { OfflineSuggestionsResponse } from "./useOfflineSuggestions";
import { predictOffline } from "./useOfflineSuggestions";

const executeOnRandomPercentile = ( operation: () => void, integerPercentChance: number ) => {
  if ( Math.random() * 100 <= integerPercentChance ) {
    operation();
  }
};

const SIMULTANEOUS_ONLINE_OFFLINE_SUGGESTION_EXPERIMENT_INTEGER_PERCENTAGE = 1;

const SCORE_IMAGE_TIMEOUT = 5_000;

const { useRealm } = RealmContext;

interface OnlineSuggestionOptions {
  onFetchError: ( options: { isOnline: boolean } ) => void;
  onFetched: ( options: { isOnline: boolean } ) => void;
  scoreImageParams?: ScoreImageParams;
  queryKey: string[];
  shouldFetchOnlineSuggestions: boolean;
}

interface UseOnlineSuggestionsResponse {
  dataUpdatedAt: number;
  onlineSuggestions?: {
    results: UseSuggestionsOnlineSuggestion[];
    common_ancestor?: UseSuggestionsOnlineSuggestion;
  };
  timedOut: boolean;
  error: Error | null;
  resetTimeout: () => void;
  refetch: () => void;
}

interface OnlineSuggestionsApiResponse {
  results: UseSuggestionsOnlineSuggestion[];
  common_ancestor?: Omit<UseSuggestionsOnlineSuggestion, "combined_score">;
}

interface OnlineSuggestionsQueryResponse {
  results: UseSuggestionsOnlineSuggestion[];
  common_ancestor?: UseSuggestionsOnlineSuggestion;
}

const shimApiResponseForCommonAncestor
  = ( apiSuggestions: OnlineSuggestionsApiResponse ): OnlineSuggestionsQueryResponse => {
    // TODO MOB-1081: maybe we can catch this shim earlier?
    // general context: https://github.com/inaturalist/iNaturalistReactNative/blob/505980d3359876a0af383f2ffcc481921f0eb778/src/components/Match/calculateConfidence.ts#L10-L12
    // online suggs have `score` but _redact_ `combined_score` for commonAncestor https://github.com/inaturalist/iNaturalistAPI/blob/main/lib/controllers/v1/computervision_controller.js#L389
    // the offline suggs have `combined_score` but don't have `score`
    // the codebase tends assumes `combined_score` for whenever that matters
    // the following catches when we're in a "fake" onlineSugg and shims "score" in
    const shimmedCommonAncestor = apiSuggestions.common_ancestor
      ? {
        ...apiSuggestions.common_ancestor,
        combined_score: apiSuggestions.common_ancestor.score,
      }
      : undefined;
    return {
      results: apiSuggestions.results,
      common_ancestor: shimmedCommonAncestor,
    };
  };

// GA has very limited support for structured data. Only certain built-in events have support for
// non-primitive data structures. We're piggybacking on those built-ins for this reporting.
// These are then mapped to more appropriately named suggestion events using "event modifications"
// in the Firebase Events Config.
// https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#purchase
const offlineEventName = "purchase";
// https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#view_item_list
const onlineEventName = "view_item_list";
// similarly, GA, at least through Firebase, doesn't seem to respect custom properties on `items`
// so we're using the generic "item_category" properties which will also be remapped.
const taxonIdPropertyName = "item_category";
const taxonScorePropertyName = "item_category2";

const logSuggestionAnalytics = (
  optimisticObservationUuid: string,
  offlineSuggestions: OfflineSuggestionsResponse,
  onlineSuggestions: OnlineSuggestionsQueryResponse,
) => {
  const transactionId = uuidv4();

  logFirebaseEvent( offlineEventName, {
    transactionId,
    optimisticObservationUuid,
    prediction_source: "offline",
    commonAncestorTaxonId: offlineSuggestions.commonAncestor?.taxon.id ?? "NA",
    commonAncestorCombinedScore: offlineSuggestions.commonAncestor?.combined_score ?? "NA",
    items: offlineSuggestions.results
      .slice( 0, 10 )
      .map( suggestion => ( {
        item_id: String( suggestion.taxon.id ),
        [taxonIdPropertyName]: String( suggestion.taxon.id ),
        [taxonScorePropertyName]: String( suggestion.combined_score ),
      } ) ),
  } );

  logFirebaseEvent( onlineEventName, {
    transactionId,
    optimisticObservationUuid,
    prediction_source: "online",
    commonAncestorTaxonId: onlineSuggestions.common_ancestor?.taxon.id ?? "NA",
    commonAncestorCombinedScore: onlineSuggestions.common_ancestor?.combined_score ?? "NA",
    items: onlineSuggestions.results
      .slice( 0, 10 )
      .map( suggestion => ( {
        item_id: String( suggestion.taxon.id ),
        [taxonIdPropertyName]: String( suggestion.taxon.id ),
        [taxonScorePropertyName]: String( suggestion.combined_score ),
      } ) ),
  } );
};

function startOfflineExperimentInBackground(
  obsUuid: string,
  shimmedOnlineResponse: OnlineSuggestionsQueryResponse,
  offlineSuggestionOperation: () => Promise<OfflineSuggestionsResponse>,
) {
  executeOnRandomPercentile( async () => {
    try {
      const offlineResult = await offlineSuggestionOperation();

      logSuggestionAnalytics( obsUuid, offlineResult, shimmedOnlineResponse );
    } catch ( _error ) { /* empty */ }
  }, SIMULTANEOUS_ONLINE_OFFLINE_SUGGESTION_EXPERIMENT_INTEGER_PERCENTAGE );
}

const useOnlineSuggestions = (
  options: OnlineSuggestionOptions,
): UseOnlineSuggestionsResponse => {
  const realm = useRealm( );
  const {
    onFetchError,
    onFetched,
    scoreImageParams,
    queryKey,
    shouldFetchOnlineSuggestions,
  } = options;

  const queryClient = useQueryClient( );
  const [timedOut, setTimedOut] = useState( false );
  const { isConnected } = useNetInfo( );
  const currentUser = useCurrentUser();
  // Use locale in case there is no user session
  const locale = i18n?.language ?? "en";

  const getCurrentObservation = useStore( state => state.getCurrentObservation );

  // TODO if this is a remote observation with an `id` param, use
  // scoreObservation instead so we don't have to spend time resizing and
  // uploading images
  const {
    data: onlineSuggestions,
    dataUpdatedAt,
    refetch,
    fetchStatus,
    error,
  } = useAuthenticatedQuery<OnlineSuggestionsQueryResponse>(
    queryKey,
    async optsWithAuth => {
      const obsUuid = getCurrentObservation().uuid;
      const params = {
        ...scoreImageParams,
        ...( !currentUser && { locale } ),
      };

      const suggestionsResponse
        = await scoreImage( params, optsWithAuth ) as OnlineSuggestionsApiResponse;

      // there's a slight discrepancy between online/offline responses which this smooths over for
      // the eventual UI
      const shimmedOnlineResponse = shimApiResponseForCommonAncestor( suggestionsResponse );

      if ( !!scoreImageParams && typeof obsUuid === "string" ) {
        startOfflineExperimentInBackground(
          obsUuid,
          shimmedOnlineResponse,
          () => predictOffline( {
            latitude: scoreImageParams.lat,
            longitude: scoreImageParams.lng,
            photoUri: scoreImageParams.image.uri,
            realm,
          } ),
        );
      }

      return shimmedOnlineResponse;
    },
    {
      enabled: !!shouldFetchOnlineSuggestions
        && !!scoreImageParams,
      allowAnonymousJWT: true,
    },
  );

  // Give up on suggestions request after a timeout
  useEffect( ( ) => {
    const timer = setTimeout( ( ) => {
      if ( onlineSuggestions === undefined ) {
        queryClient.cancelQueries( { queryKey } );
        onFetchError( { isOnline: true } );
        setTimedOut( true );
      }
    }, SCORE_IMAGE_TIMEOUT );

    return ( ) => {
      clearTimeout( timer );
    };
  }, [onlineSuggestions, queryKey, queryClient, onFetchError] );

  const resetTimeout = useCallback( ( ) => {
    setTimedOut( false );
  }, [] );

  useEffect( () => {
    if ( isConnected === false ) {
      setTimedOut( true );
    }
  }, [isConnected] );

  useEffect( ( ) => {
    if ( onlineSuggestions !== undefined ) {
      // we're already getting all this taxon information anytime we make this API
      // call, so we might as well store it in realm immediately instead of waiting
      // for useTaxon to fetch individual taxon results
      const mappedTaxa = onlineSuggestions.results.map(
        suggestion => Taxon.mapApiToRealm( suggestion.taxon, realm ),
      );
      if ( onlineSuggestions?.common_ancestor ) {
        const mappedCommonAncestor = Taxon
          .mapApiToRealm( onlineSuggestions?.common_ancestor.taxon, realm );
        mappedTaxa.push( mappedCommonAncestor );
      }
      safeRealmWrite( realm, ( ) => {
        mappedTaxa.forEach( remoteTaxon => {
          realm.create(
            "Taxon",
            Taxon.forUpdate( remoteTaxon ),
            UpdateMode.Modified,
          );
        } );
      }, "saving remote taxon from onlineSuggestions" );
      onFetched( { isOnline: true } );
    } else if ( error ) {
      onFetchError( { isOnline: true } );
    }
  }, [onFetchError, onlineSuggestions, error, onFetched, realm] );

  const queryObject = {
    dataUpdatedAt,
    error,
    refetch,
    timedOut,
    resetTimeout,
    fetchStatus,
  };

  return timedOut
    ? {
      ...queryObject,
      onlineSuggestions: undefined,
    }
    : {
      ...queryObject,
      onlineSuggestions,
    };
};

export default useOnlineSuggestions;
