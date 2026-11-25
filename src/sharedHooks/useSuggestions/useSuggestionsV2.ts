import { exists } from "@dr.pogodin/react-native-fs";
import { useNetInfo } from "@react-native-community/netinfo";
import type { QueryClient } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import scoreImage from "api/computerVision";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams";
import i18n from "i18next";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect, useMemo, useReducer,
} from "react";
import type Realm from "realm";
import { UpdateMode } from "realm";
import Taxon from "realmModels/Taxon";
import { log } from "sharedHelpers/logger";
import { handleRetryDelay, reactQueryRetry } from "sharedHelpers/logging";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import useCurrentUser from "sharedHooks/useCurrentUser";

import filterSuggestions from "./filterSuggestions";
import { startOfflineExperimentInBackground } from "./suggestionComparisonExperiment";
import type { OfflineSuggestionsResponse } from "./useOfflineSuggestions";
import { predictOffline } from "./useOfflineSuggestions";
import type {
  OnlineSuggestionsApiResponse,
  OnlineSuggestionsQueryResponse,
} from "./useOnlineSuggestions";
import {
  INITIAL_SCORE_IMAGE_TIMEOUT,
  RETRY_SCORE_IMAGE_TIMEOUT,
  shimApiResponseForCommonAncestor,
} from "./useOnlineSuggestions";

const logger = log.extend( "useSuggestionsV2" );

const { useRealm } = RealmContext;

// "offline" means the device had no connection, either before the request
// started or while it was in flight
export type OnlineStatus = "idle" | "loading" | "fetched" | "error" | "timed-out" | "offline";
// "idle" while waiting on the online request; "skipped" when online succeeded
// or the photo is remote and we're offline
export type OfflineStatus = "idle" | "loading" | "fetched" | "error" | "skipped";

interface Location {
  latitude?: number | null;
  longitude?: number | null;
}

// both or neither, so half a pair can't reach the server or the model
interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UseSuggestionsV2Options {
  photoUri?: string | null;
  // each new coordinate pair starts a new request, so hold it steady while a
  // GPS fix is still settling
  location?: Location | null;
  // e.g. hold off until location permission is known
  enabled?: boolean;
  // only used for the online/offline comparison experiment
  observationUuid?: string;
  // defaults to INITIAL_SCORE_IMAGE_TIMEOUT, or RETRY_SCORE_IMAGE_TIMEOUT
  // after retry()
  onlineTimeoutMs?: number;
}

// 20240815 amanda - passing an https photo to predictImage while offline
// crashes the app
const willCrashOffline = ( photoUri: string, isConnected: boolean | null ) => (
  photoUri.includes( "https://" ) && !isConnected
);

// Resizing won't succeed on a retry, and reactQueryRetry turns errors without
// an API response into unhandled rejections, so these skip it
const PHOTO_RESIZE_ERROR = "PhotoResizeError";

// Resized once per photo; reloads and location changes reuse the file
const resizePhoto = async ( photoUri: string, queryClient: QueryClient ) => {
  const queryKey = ["resizedPhotoForScoreImage", photoUri];
  const resize = ( ) => queryClient.fetchQuery( {
    queryKey,
    queryFn: async ( ) => ( await flattenUploadParams( photoUri ) ).image,
    staleTime: Infinity,
    retry: false,
    // resizing is local, so it shouldn't wait for react-query to think the
    // device is online
    networkMode: "always",
  } );
  try {
    const image = await resize( );
    // startup cleanup and sign-out empty the folder the file is in
    if ( await exists( image.uri.replace( /^file:\/\//, "" ) ) ) return image;
    queryClient.removeQueries( { queryKey } );
    return await resize( );
  } catch ( resizeError ) {
    const error = new Error( `Couldn't resize photo: ${( resizeError as Error ).message}` );
    error.name = PHOTO_RESIZE_ERROR;
    throw error;
  }
};

const onlineQueryKeyPrefix = ( photoUri?: string | null, coordinates?: Coordinates ) => [
  "scoreImageV2",
  photoUri ?? null,
  coordinates?.latitude ?? null,
  coordinates?.longitude ?? null,
];

const saveTaxaToRealm = ( realm: Realm, response: OnlineSuggestionsQueryResponse ) => {
  // we already have this taxon info, so store it now instead of waiting for
  // useTaxon to fetch each one. It's only a cache, so a failure here shouldn't
  // throw away the suggestions
  const apiTaxa = response.results.map( suggestion => suggestion.taxon );
  if ( response.common_ancestor ) {
    apiTaxa.push( response.common_ancestor.taxon );
  }
  try {
    safeRealmWrite( realm, ( ) => {
      apiTaxa.forEach( apiTaxon => {
        const remoteTaxon = Taxon.mapApiToRealm( apiTaxon, realm );
        realm.create( "Taxon", Taxon.forUpdate( remoteTaxon ), UpdateMode.Modified );
      } );
    }, "saving remote taxon from useSuggestionsV2" );
  } catch ( saveError ) {
    logger.error( "Failed to save suggested taxa", saveError );
  }
};

interface ScoreOnlineParams {
  photoUri: string;
  coordinates?: Coordinates;
  locale?: string;
  observationUuid?: string;
  queryClient: QueryClient;
  realm: Realm;
}

const scoreOnline = async ( {
  photoUri, coordinates, locale, observationUuid, queryClient, realm,
}: ScoreOnlineParams ) => {
  const image = await resizePhoto( photoUri, queryClient );
  const apiToken = await getJWT( true );
  const params = {
    image,
    ...( coordinates && { lat: coordinates.latitude, lng: coordinates.longitude } ),
    ...( locale && { locale } ),
  };
  const apiResponse = await scoreImage(
    params,
    { api_token: apiToken },
  ) as OnlineSuggestionsApiResponse;
  const response = shimApiResponseForCommonAncestor( apiResponse );
  saveTaxaToRealm( realm, response );
  if ( observationUuid ) {
    startOfflineExperimentInBackground(
      observationUuid,
      response,
      ( ) => predictOffline( { ...coordinates, photoUri: image.uri, realm } ),
    );
  }
  return response;
};

// What the hook has to remember about the server attempt for the current
// inputs. It starts over whenever the inputs change
interface Attempt {
  inputs: string | null;
  // the server attempt was abandoned, and stays abandoned until retry()
  gaveUp?: "timed-out" | "offline";
  // the user asked for this attempt, so the server gets longer
  isRetry: boolean;
}

type AttemptAction =
  | { type: "INPUTS_CHANGED"; inputs: string | null }
  | { type: "GAVE_UP"; inputs: string | null; reason: "timed-out" | "offline" }
  | { type: "RETRIED"; inputs: string | null };

const newAttempt = ( inputs: string | null ): Attempt => ( { inputs, isRetry: false } );

const attemptReducer = ( state: Attempt, action: AttemptAction ): Attempt => {
  if ( action.type === "INPUTS_CHANGED" ) return newAttempt( action.inputs );
  // an event from earlier inputs
  if ( action.inputs !== state.inputs ) return state;
  switch ( action.type ) {
    case "GAVE_UP":
      return state.gaveUp
        ? state
        : { ...state, gaveUp: action.reason };
    case "RETRIED":
      return { inputs: state.inputs, isRetry: true };
    default:
      return state;
  }
};

const useSuggestionsV2 = ( {
  photoUri,
  location,
  enabled = true,
  observationUuid,
  onlineTimeoutMs,
}: UseSuggestionsV2Options ) => {
  const realm = useRealm( );
  const queryClient = useQueryClient( );
  const currentUser = useCurrentUser( );
  const { isConnected } = useNetInfo( );

  const latitude = location?.latitude;
  const longitude = location?.longitude;
  const coordinates = useMemo( ( ): Coordinates | undefined => (
    typeof latitude === "number" && typeof longitude === "number"
      ? { latitude, longitude }
      : undefined
  ), [latitude, longitude] );

  const language = i18n?.language ?? "en";
  const locale = currentUser
    ? undefined
    : language;

  const inputs = enabled && photoUri
    ? JSON.stringify( [photoUri, coordinates ?? null, language] )
    : null;

  const [storedAttempt, dispatch] = useReducer( attemptReducer, inputs, newAttempt );
  // Start over when the inputs change. Adjusting state during render is
  // React's alternative to an effect that resets state after a prop changes
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if ( storedAttempt.inputs !== inputs ) {
    dispatch( { type: "INPUTS_CHANGED", inputs } );
  }
  const attempt = storedAttempt.inputs === inputs
    ? storedAttempt
    : newAttempt( inputs );

  const onlineKey = useMemo(
    ( ) => [...onlineQueryKeyPrefix( photoUri, coordinates ), language],
    [photoUri, coordinates, language],
  );

  const online = useQuery( {
    // locale follows language, which is in the key; realm and observationUuid
    // don't affect the response
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: onlineKey,
    queryFn: ( ) => scoreOnline( {
      photoUri: photoUri as string, coordinates, locale, observationUuid, queryClient, realm,
    } ),
    enabled: !!inputs && isConnected !== false && !attempt.gaveUp,
    // This hook decides when the device is offline. React-query's own idea of
    // it comes from NetInfo too, but treats "not known yet" as offline and
    // would hold the request without starting the timeout
    networkMode: "always",
    staleTime: Infinity,
    retry: ( failureCount, error ) => error.name !== PHOTO_RESIZE_ERROR
      && reactQueryRetry( failureCount, error, { queryKey: onlineKey } ),
    retryDelay: ( failureCount, error ) => handleRetryDelay( failureCount, error ),
    // a failed attempt stays failed until retry()
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  } );

  // Give up on a slow server. Fall back to the on-device model quickly at
  // first, but give the server longer when the user asked for another try
  const timeoutMs = onlineTimeoutMs ?? (
    attempt.isRetry
      ? RETRY_SCORE_IMAGE_TIMEOUT
      : INITIAL_SCORE_IMAGE_TIMEOUT
  );
  const waitingOnServer = !!inputs && online.isFetching;
  useEffect( ( ) => {
    const timer = waitingOnServer
      ? setTimeout( ( ) => {
        dispatch( { type: "GAVE_UP", inputs, reason: "timed-out" } );
        queryClient.cancelQueries( { queryKey: onlineKey } );
      }, timeoutMs )
      : undefined;
    return ( ) => clearTimeout( timer );
  }, [waitingOnServer, timeoutMs, inputs, onlineKey, queryClient] );

  // Losing the connection ends the server attempt, even if it comes back
  useEffect( ( ) => {
    if ( isConnected !== false ) return;
    dispatch( { type: "GAVE_UP", inputs, reason: "offline" } );
    queryClient.cancelQueries( { queryKey: onlineKey } );
  }, [isConnected, inputs, onlineKey, queryClient] );

  // gaveUp only explains why there's no answer; an answer that arrived before
  // giving up still counts
  let onlineStatus: OnlineStatus = "loading";
  if ( !inputs ) {
    onlineStatus = "idle";
  } else if ( online.isSuccess ) {
    onlineStatus = "fetched";
  } else if ( online.isError ) {
    onlineStatus = "error";
  } else if ( attempt.gaveUp ) {
    onlineStatus = attempt.gaveUp;
  } else if ( isConnected === false ) {
    onlineStatus = "offline";
  }

  const onlineFailed = onlineStatus === "error"
    || onlineStatus === "timed-out"
    || onlineStatus === "offline";
  const urlWillCrashOffline = !!photoUri && willCrashOffline( photoUri, isConnected );

  const offline = useQuery<OfflineSuggestionsResponse>( {
    // coordinates are in the key as latitude and longitude; realm doesn't
    // affect the result
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "predictOfflineV2",
      photoUri ?? null,
      coordinates?.latitude ?? null,
      coordinates?.longitude ?? null,
    ],
    queryFn: async ( ) => await predictOffline( {
      ...coordinates, photoUri: photoUri as string, realm,
    } ) ?? { results: [] },
    enabled: !!inputs && onlineFailed && !urlWillCrashOffline,
    // the on-device model is for when the device is offline
    networkMode: "always",
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  } );

  let offlineStatus: OfflineStatus = "loading";
  if ( !inputs || onlineStatus === "loading" ) {
    offlineStatus = "idle";
  } else if ( onlineStatus === "fetched" || urlWillCrashOffline ) {
    offlineStatus = "skipped";
  } else if ( offline.isSuccess ) {
    offlineStatus = "fetched";
  } else if ( offline.isError ) {
    offlineStatus = "error";
  }

  const retry = useCallback( ( ) => {
    dispatch( { type: "RETRIED", inputs } );
    queryClient.resetQueries( { queryKey: onlineKey } );
  }, [inputs, onlineKey, queryClient] );

  const onlineSuggestions = onlineStatus === "fetched"
    ? online.data
    : undefined;
  const offlineSuggestions = offlineStatus === "fetched"
    ? offline.data
    : undefined;

  const suggestions = useMemo( ( ) => {
    if ( onlineSuggestions ) {
      return filterSuggestions( onlineSuggestions.results, onlineSuggestions.common_ancestor );
    }
    if ( offlineSuggestions ) {
      return filterSuggestions( offlineSuggestions.results, offlineSuggestions.commonAncestor );
    }
    return filterSuggestions( [] );
  }, [onlineSuggestions, offlineSuggestions] );

  return {
    suggestions,
    isLoading: onlineStatus === "loading" || offlineStatus === "loading",
    onlineStatus,
    offlineStatus,
    onlineError: onlineStatus === "error"
      ? online.error ?? undefined
      : undefined,
    offlineError: offlineStatus === "error"
      ? offline.error ?? undefined
      : undefined,
    // the unfiltered response, for debugging
    onlineSuggestions,
    usingOfflineSuggestions: offlineStatus === "loading"
      || offlineStatus === "fetched"
      || offlineStatus === "error",
    urlWillCrashOffline,
    retry,
  };
};

export default useSuggestionsV2;
