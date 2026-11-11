import type { QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import scoreImage from "api/computerVision";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import flattenUploadParams from "components/Suggestions/helpers/flattenUploadParams";
import i18n from "i18next";
import {
  useEffect, useMemo, useReducer, useRef,
} from "react";
import { handleRetryDelay, reactQueryRetry } from "sharedHelpers/logging";
import useCurrentUser from "sharedHooks/useCurrentUser";

import filterSuggestions from "./filterSuggestions";
import type {
  OnlineSuggestionsApiResponse,
  OnlineSuggestionsQueryResponse,
} from "./useOnlineSuggestions";
import { shimApiResponseForCommonAncestor } from "./useOnlineSuggestions";

export type OnlineStatus = "idle" | "loading" | "fetched" | "error";

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
  onlineSuggestions?: OnlineSuggestionsQueryResponse;
  onlineError?: Error;
}

type Action =
  | {
    type: "RUN_STARTED";
    inputKey: string;
    onlineStatus: "loading";
  }
  | {
    type: "ONLINE_SETTLED";
    onlineStatus: Exclude<OnlineStatus, "idle" | "loading">;
    onlineSuggestions?: OnlineSuggestionsQueryResponse;
    onlineError?: Error;
  };

const initialState: State = {
  inputKey: null,
  onlineStatus: "idle",
};

const reducer = ( state: State, action: Action ): State => {
  switch ( action.type ) {
    case "RUN_STARTED":
      return {
        inputKey: action.inputKey,
        onlineStatus: action.onlineStatus,
      };
    case "ONLINE_SETTLED":
      return {
        ...state,
        onlineStatus: action.onlineStatus,
        onlineSuggestions: action.onlineSuggestions,
        onlineError: action.onlineError,
      };
    default:
      return state;
  }
};

interface Run {
  cancelled: boolean;
}

interface RunParams {
  run: Run;
  inputKey: string;
  photoUri: string;
  latitude?: number;
  longitude?: number;
  locale?: string;
  queryClient: QueryClient;
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
  const { run, inputKey, dispatch: rawDispatch } = params;
  const dispatch = ( action: Action ) => {
    if ( !run.cancelled ) rawDispatch( action );
  };

  dispatch( { type: "RUN_STARTED", inputKey, onlineStatus: "loading" } );
  const outcome = await fetchOnline( params );
  if ( run.cancelled ) return;

  if ( outcome.status === "fetched" ) {
    dispatch( {
      type: "ONLINE_SETTLED",
      onlineStatus: "fetched",
      onlineSuggestions: outcome.data,
    } );
    return;
  }

  dispatch( {
    type: "ONLINE_SETTLED",
    onlineStatus: "error",
    onlineError: outcome.error,
  } );
};

const useSuggestionsV2 = ( {
  photoUri,
  location,
}: UseSuggestionsV2Options ) => {
  const queryClient = useQueryClient( );
  const currentUser = useCurrentUser( );
  const [state, dispatch] = useReducer( reducer, initialState );

  const latitude = location?.latitude ?? undefined;
  const longitude = location?.longitude ?? undefined;

  // logged-out users need a locale for common names
  const locale = currentUser
    ? undefined
    : i18n?.language ?? "en";

  // values a run reads when it starts, but that shouldn't start a new run
  // when they change
  const latest = useRef( { locale, queryClient } );
  // declared before the run effect so it updates first in the same commit
  useEffect( ( ) => {
    latest.current = { locale, queryClient };
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
        locale: current.locale,
        queryClient: current.queryClient,
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
  const { onlineStatus, onlineSuggestions } = view;

  const suggestions = useMemo( ( ) => {
    if ( onlineSuggestions ) {
      return filterSuggestions( onlineSuggestions.results, onlineSuggestions.common_ancestor );
    }
    return filterSuggestions( [] );
  }, [onlineSuggestions] );

  return {
    suggestions,
    isLoading: onlineStatus === "loading",
    onlineStatus,
    onlineError: view.onlineError,
  };
};

export default useSuggestionsV2;
