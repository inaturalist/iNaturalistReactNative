import { useNetInfo } from "@react-native-community/netinfo";
import type { QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import scoreImage from "api/computerVision";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams";
import i18n from "i18next";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect, useMemo, useReducer, useRef, useState,
} from "react";
import type Realm from "realm";
import { handleRetryDelay, reactQueryRetry } from "sharedHelpers/logging";
import useCurrentUser from "sharedHooks/useCurrentUser";

import filterSuggestions from "./filterSuggestions";
import type { OfflineSuggestionsResponse } from "./useOfflineSuggestions";
import { predictOffline } from "./useOfflineSuggestions";
import type {
  OnlineSuggestionsApiResponse,
  OnlineSuggestionsQueryResponse,
} from "./useOnlineSuggestions";
import { shimApiResponseForCommonAncestor } from "./useOnlineSuggestions";

const { useRealm } = RealmContext;

export const SCORE_IMAGE_TIMEOUT = 5_000;

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

export interface UseSuggestionsV2Options {
  photoUri?: string | null;
  location?: Location | null;
  onlineTimeoutMs?: number;
}

interface State {
  inputKey: string | null;
  onlineStatus: OnlineStatus;
  offlineStatus: OfflineStatus;
  onlineSuggestions?: OnlineSuggestionsQueryResponse;
  offlineSuggestions?: OfflineSuggestionsResponse;
  onlineError?: Error;
  offlineError?: Error;
}

type Action =
  | {
    type: "RUN_STARTED";
    inputKey: string;
    onlineStatus: "loading" | "offline";
    offlineStatus: "idle" | "loading" | "skipped";
  }
  | {
    type: "ONLINE_SETTLED";
    onlineStatus: Exclude<OnlineStatus, "idle" | "loading">;
    offlineStatus: "loading" | "skipped";
    onlineSuggestions?: OnlineSuggestionsQueryResponse;
    onlineError?: Error;
  }
  | {
    type: "OFFLINE_SETTLED";
    offlineStatus: "fetched" | "error";
    offlineSuggestions?: OfflineSuggestionsResponse;
    offlineError?: Error;
  };

const initialState: State = {
  inputKey: null,
  onlineStatus: "idle",
  offlineStatus: "idle",
};

const reducer = ( state: State, action: Action ): State => {
  switch ( action.type ) {
    case "RUN_STARTED":
      return {
        inputKey: action.inputKey,
        onlineStatus: action.onlineStatus,
        offlineStatus: action.offlineStatus,
      };
    case "ONLINE_SETTLED":
      return {
        ...state,
        onlineStatus: action.onlineStatus,
        offlineStatus: action.offlineStatus,
        onlineSuggestions: action.onlineSuggestions,
        onlineError: action.onlineError,
      };
    case "OFFLINE_SETTLED":
      return {
        ...state,
        offlineStatus: action.offlineStatus,
        offlineSuggestions: action.offlineSuggestions,
        offlineError: action.offlineError,
      };
    default:
      return state;
  }
};

// 20240815 amanda - passing an https photo to predictImage while offline
// crashes the app
const willCrashOffline = ( photoUri: string, isConnected: boolean | null ) => (
  photoUri.includes( "https://" ) && !isConnected
);

const onlineQueryKeyPrefix = ( photoUri: string, latitude?: number, longitude?: number ) => [
  "scoreImageV2",
  photoUri,
  latitude ?? null,
  longitude ?? null,
];

interface Run {
  cancelled: boolean;
  // ends the online attempt early, e.g. when the connection drops
  interruptOnline?: ( status: "offline" | "cancelled" ) => void;
}

interface RunParams {
  run: Run;
  inputKey: string;
  photoUri: string;
  latitude?: number;
  longitude?: number;
  isConnected: () => boolean | null;
  language: string;
  locale?: string;
  onlineTimeoutMs: number;
  queryClient: QueryClient;
  realm: Realm;
  dispatch: ( action: Action ) => void;
}

type OnlineOutcome =
  | { status: "fetched"; data: OnlineSuggestionsQueryResponse }
  | { status: "error"; error: Error }
  | { status: "timed-out" | "offline" | "cancelled" };

const fetchOnline = async ( {
  run, photoUri, latitude, longitude, language, locale, onlineTimeoutMs, queryClient,
}: RunParams ): Promise<OnlineOutcome> => {
  const queryKey = [...onlineQueryKeyPrefix( photoUri, latitude, longitude ), language];

  const queryFn = async ( ) => {
    const { image } = await flattenUploadParams( photoUri );
    const apiToken = await getJWT( true );
    const hasLocation = typeof latitude === "number" && typeof longitude === "number";
    const params = {
      image,
      ...( hasLocation && { lat: latitude, lng: longitude } ),
      ...( locale && { locale } ),
    };
    const apiResponse = await scoreImage(
      params,
      { api_token: apiToken },
    ) as OnlineSuggestionsApiResponse;
    return shimApiResponseForCommonAncestor( apiResponse );
  };

  const request = queryClient.fetchQuery( {
    queryKey,
    queryFn,
    // a given photo and location always score the same, so reuse results
    // until the query is garbage collected
    staleTime: Infinity,
    retry: ( failureCount, error ) => reactQueryRetry( failureCount, error, { queryKey } ),
    retryDelay: ( failureCount, error ) => handleRetryDelay( failureCount, error ),
  } );

  let timer: ReturnType<typeof setTimeout> | undefined;
  const outcome = await new Promise<OnlineOutcome>( resolve => {
    // whichever settles first wins
    timer = setTimeout( ( ) => resolve( { status: "timed-out" } ), onlineTimeoutMs );
    run.interruptOnline = status => resolve( { status } );
    request.then(
      data => resolve( { status: "fetched", data } ),
      error => resolve( { status: "error", error } ),
    );
  } );
  clearTimeout( timer );
  run.interruptOnline = undefined;

  // a cancelled run leaves the request alone so the next run with the same
  // inputs (e.g. a remount) can pick it up
  if ( outcome.status === "timed-out" || outcome.status === "offline" ) {
    queryClient.cancelQueries( { queryKey } );
  }
  return outcome;
};

const runSuggestions = async ( params: RunParams ) => {
  const {
    run, inputKey, photoUri, latitude, longitude, isConnected, realm, dispatch: rawDispatch,
  } = params;
  const dispatch = ( action: Action ) => {
    if ( !run.cancelled ) rawDispatch( action );
  };

  const runOffline = async ( ) => {
    try {
      const offlineSuggestions = await predictOffline( {
        latitude, longitude, photoUri, realm,
      } );
      dispatch( {
        type: "OFFLINE_SETTLED",
        offlineStatus: "fetched",
        offlineSuggestions: offlineSuggestions ?? { results: [] },
      } );
    } catch ( offlineError ) {
      dispatch( {
        type: "OFFLINE_SETTLED",
        offlineStatus: "error",
        offlineError: offlineError as Error,
      } );
    }
  };

  if ( isConnected( ) === false ) {
    const skipOffline = willCrashOffline( photoUri, false );
    dispatch( {
      type: "RUN_STARTED",
      inputKey,
      onlineStatus: "offline",
      offlineStatus: skipOffline
        ? "skipped"
        : "loading",
    } );
    if ( !skipOffline ) await runOffline( );
    return;
  }

  dispatch( {
    type: "RUN_STARTED", inputKey, onlineStatus: "loading", offlineStatus: "idle",
  } );
  const outcome = await fetchOnline( params );
  if ( run.cancelled || outcome.status === "cancelled" ) return;

  if ( outcome.status === "fetched" ) {
    dispatch( {
      type: "ONLINE_SETTLED",
      onlineStatus: "fetched",
      offlineStatus: "skipped",
      onlineSuggestions: outcome.data,
    } );
    return;
  }

  const skipOffline = willCrashOffline( photoUri, isConnected( ) );
  dispatch( {
    type: "ONLINE_SETTLED",
    onlineStatus: outcome.status,
    offlineStatus: skipOffline
      ? "skipped"
      : "loading",
    onlineError: outcome.status === "error"
      ? outcome.error
      : undefined,
  } );
  if ( !skipOffline ) await runOffline( );
};

const useSuggestionsV2 = ( {
  photoUri,
  location,
  onlineTimeoutMs = SCORE_IMAGE_TIMEOUT,
}: UseSuggestionsV2Options ) => {
  const realm = useRealm( );
  const queryClient = useQueryClient( );
  const currentUser = useCurrentUser( );
  const { isConnected } = useNetInfo( );
  const [state, dispatch] = useReducer( reducer, initialState );
  const [attempt, setAttempt] = useState( 0 );

  const latitude = location?.latitude ?? undefined;
  const longitude = location?.longitude ?? undefined;

  // Common names follow the app language. Signed-in users get it from their
  // account, so only logged-out users send it
  const language = i18n?.language ?? "en";
  const locale = currentUser
    ? undefined
    : language;

  // values a run reads when it starts or as it goes, but that shouldn't
  // start a new run when they change
  const latest = useRef( {
    isConnected, language, locale, onlineTimeoutMs, queryClient, realm,
  } );
  // declared before the run effect so it updates first in the same commit
  useEffect( ( ) => {
    latest.current = {
      isConnected, language, locale, onlineTimeoutMs, queryClient, realm,
    };
  } );

  const inputKey = photoUri
    ? JSON.stringify( [photoUri, latitude ?? null, longitude ?? null, attempt] )
    : null;

  const runRef = useRef<Run | null>( null );

  useEffect( ( ) => {
    const run: Run = { cancelled: false };
    if ( inputKey && photoUri ) {
      runRef.current = run;
      const { current } = latest;
      runSuggestions( {
        run,
        inputKey,
        photoUri,
        latitude,
        longitude,
        isConnected: ( ) => latest.current.isConnected,
        language: current.language,
        locale: current.locale,
        onlineTimeoutMs: current.onlineTimeoutMs,
        queryClient: current.queryClient,
        realm: current.realm,
        dispatch,
      } );
    }
    return ( ) => {
      run.cancelled = true;
      run.interruptOnline?.( "cancelled" );
    };
  }, [inputKey, photoUri, latitude, longitude] );

  useEffect( ( ) => {
    if ( isConnected === false ) {
      runRef.current?.interruptOnline?.( "offline" );
    }
  }, [isConnected] );

  const retry = useCallback( ( ) => {
    if ( !photoUri ) return;
    queryClient.removeQueries( {
      queryKey: onlineQueryKeyPrefix( photoUri, latitude, longitude ),
    } );
    setAttempt( a => a + 1 );
  }, [photoUri, latitude, longitude, queryClient] );

  // State from previous inputs is stale. Report a run that hasn't started
  // yet as loading so callers never see a "no suggestions" frame
  const view: State = !!inputKey && state.inputKey === inputKey
    ? state
    : {
      ...initialState,
      onlineStatus: inputKey
        ? "loading"
        : "idle",
    };
  const {
    onlineStatus, offlineStatus, onlineSuggestions, offlineSuggestions,
  } = view;

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
    onlineError: view.onlineError,
    offlineError: view.offlineError,
    usingOfflineSuggestions: offlineStatus === "loading"
      || offlineStatus === "fetched"
      || offlineStatus === "error",
    urlWillCrashOffline: !!photoUri && willCrashOffline( photoUri, isConnected ),
    retry,
  };
};

export default useSuggestionsV2;
