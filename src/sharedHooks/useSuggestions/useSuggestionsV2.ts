import { useNetInfo } from "@react-native-community/netinfo";
import type { QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import scoreImage from "api/computerVision";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams";
import i18n from "i18next";
import { RealmContext } from "providers/contexts";
import {
  useEffect, useMemo, useReducer, useRef,
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

// "offline" means the device had no connection when the run started
export type OnlineStatus = "idle" | "loading" | "fetched" | "error" | "offline";
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

interface Run {
  cancelled: boolean;
}

interface RunParams {
  run: Run;
  inputKey: string;
  photoUri: string;
  latitude?: number;
  longitude?: number;
  isConnected: () => boolean | null;
  locale?: string;
  queryClient: QueryClient;
  realm: Realm;
  dispatch: ( action: Action ) => void;
}

type OnlineOutcome =
  | { status: "fetched"; data: OnlineSuggestionsQueryResponse }
  | { status: "error"; error: Error };

const fetchOnline = async ( {
  photoUri, latitude, longitude, locale, queryClient,
}: RunParams ): Promise<OnlineOutcome> => {
  const queryKey = ["scoreImageV2", photoUri, latitude ?? null, longitude ?? null, locale ?? null];

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

  try {
    const data = await queryClient.fetchQuery( {
      queryKey,
      queryFn,
      retry: ( failureCount, error ) => reactQueryRetry( failureCount, error, { queryKey } ),
      retryDelay: ( failureCount, error ) => handleRetryDelay( failureCount, error ),
    } );
    return { status: "fetched", data };
  } catch ( error ) {
    return { status: "error", error: error as Error };
  }
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
  if ( run.cancelled ) return;

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
    onlineStatus: "error",
    offlineStatus: skipOffline
      ? "skipped"
      : "loading",
    onlineError: outcome.error,
  } );
  if ( !skipOffline ) await runOffline( );
};

const useSuggestionsV2 = ( {
  photoUri,
  location,
}: UseSuggestionsV2Options ) => {
  const realm = useRealm( );
  const queryClient = useQueryClient( );
  const currentUser = useCurrentUser( );
  const { isConnected } = useNetInfo( );
  const [state, dispatch] = useReducer( reducer, initialState );

  const latitude = location?.latitude ?? undefined;
  const longitude = location?.longitude ?? undefined;

  // logged-out users need a locale for common names
  const locale = currentUser
    ? undefined
    : i18n?.language ?? "en";

  // values a run reads when it starts or as it goes, but that shouldn't
  // start a new run when they change
  const latest = useRef( {
    isConnected, locale, queryClient, realm,
  } );
  // declared before the run effect so it updates first in the same commit
  useEffect( ( ) => {
    latest.current = {
      isConnected, locale, queryClient, realm,
    };
  } );

  const inputKey = photoUri
    ? JSON.stringify( [photoUri, latitude ?? null, longitude ?? null] )
    : null;

  useEffect( ( ) => {
    const run: Run = { cancelled: false };
    if ( inputKey && photoUri ) {
      const { current } = latest;
      runSuggestions( {
        run,
        inputKey,
        photoUri,
        latitude,
        longitude,
        isConnected: ( ) => latest.current.isConnected,
        locale: current.locale,
        queryClient: current.queryClient,
        realm: current.realm,
        dispatch,
      } );
    }
    return ( ) => {
      run.cancelled = true;
    };
  }, [inputKey, photoUri, latitude, longitude] );

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
  };
};

export default useSuggestionsV2;
