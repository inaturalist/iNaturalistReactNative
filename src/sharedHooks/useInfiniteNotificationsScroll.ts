import { useQueryClient } from "@tanstack/react-query";
import { fetchObservationUpdates, fetchRemoteObservations } from "api/observations";
import type {
  ApiNotification,
  ApiObservation,
  ApiObservationsUpdatesParams,
  ApiOpts,
} from "api/types";
import flatten from "lodash/flatten";
import { RealmContext } from "providers/contexts";
import { useEffect, useMemo, useState } from "react";
import type Realm from "realm";
import Observation from "realmModels/Observation";
import { useAuthenticatedInfiniteQuery, useCurrentUser } from "sharedHooks";

const { useRealm } = RealmContext;

const LOADING_TIMEOUT = 5000;

// Extends API response with data we need in this app
export interface Notification extends ApiNotification {
  resource?: ApiObservation;
  viewerOwnsResource?: boolean;
}

interface InfiniteNotificationsScrollResponse {
  fetchNextPage: ( ) => void;
  isError?: boolean;
  isFetching?: boolean;
  isInitialLoading?: boolean;
  loadingTimedOut: boolean;
  notifications: Notification[];
  refetch: ( ) => void;
}

const UPDATE_FIELDS = {
  comment_id: true,
  comment: {
    user: {
      login: true,
    },
  },
  created_at: true,
  id: true,
  identification_id: true,
  identification: {
    user: {
      login: true,
    },
  },
  notifier_type: true,
  resource_uuid: true,
  viewed: true,
};

const BASE_PARAMS: ApiObservationsUpdatesParams = {
  // observations_by: "owner",
  fields: UPDATE_FIELDS,
  per_page: 30,
  ttl: -1,
  page: 1,
};

async function fetchObsByUUIDs(
  uuids: string[],
  authOptions: ApiOpts,
  realm: Realm,
  options: {
    save?: boolean;
  } = {},
) {
  // TODO convert api/observations to TS
  const observations: ApiObservation[] | null = await fetchRemoteObservations(
    uuids,
    {
      fields: {
        user: {
          id: true,
          login: true,
        },
        ...Observation.ADVANCED_MODE_LIST_FIELDS,
      },
    },
    authOptions,
  );
  if ( options.save ) {
    Observation.upsertRemoteObservations( observations, realm );
  }
  return observations;
}

const useInfiniteNotificationsScroll = (
  notificationParams: ApiObservationsUpdatesParams = {},
): InfiniteNotificationsScrollResponse => {
  const currentUser = useCurrentUser( );
  const realm = useRealm( );
  const queryClient = useQueryClient();
  const [loadingTimedOut, setLoadingTimedOut] = useState( false );

  const queryKey = useMemo(
    () => ["useInfiniteNotificationsScroll", JSON.stringify( notificationParams )],
    [notificationParams],
  );

  const infQueryResult = useAuthenticatedInfiniteQuery(
    queryKey,
    async ( { pageParam }: { pageParam: number }, optsWithAuth: ApiOpts ) => {
      const params = { ...BASE_PARAMS, ...notificationParams };

      if ( pageParam ) {
        params.page = pageParam;
      } else {
        params.page = 1;
      }

      const response: null | ApiNotification[] = await fetchObservationUpdates(
        params,
        optsWithAuth,
      );

      // Sometimes updates linger after notifiers that generated them have been deleted
      const updatesWithContent = response?.filter(
        update => update.comment || update.identification,
      ) || [];
      const obsUUIDs = updatesWithContent.map( obsUpdate => obsUpdate.resource_uuid );
      if ( obsUUIDs.length > 0 ) {
        const observations = await fetchObsByUUIDs(
          obsUUIDs,
          optsWithAuth,
          realm,
          { save: params.observations_by === "owner" },
        );
        if ( observations ) {
          return updatesWithContent.map( ( update: Notification ) => {
            const resource = observations.find(
              ( o: ApiObservation ) => o.uuid === update.resource_uuid,
            );
            update.resource = resource;
            update.viewerOwnsResource = resource?.user?.id === currentUser?.id;
            return update;
          } );
        }
      }

      return updatesWithContent;
    },
    {
      getNextPageParam: ( lastPage, allPages ) => ( lastPage.length > 0
        ? allPages.length + 1
        : undefined ),
      enabled: !!( currentUser ),
    },
  );

  // We want to timeout and show an offline/retry state if this request takes too long
  useEffect( () => {
    // Reset if we get data
    if ( infQueryResult.data !== undefined && !infQueryResult.isFetching ) {
      setLoadingTimedOut( false );
      return undefined;
    }

    // Don't set timer if not loading
    if ( !infQueryResult.isFetching ) {
      return undefined;
    }

    // Set a timeout and cancel the query if we hit the limit
    const timer = setTimeout( () => {
      if ( infQueryResult.data === undefined && infQueryResult.isFetching ) {
        queryClient.cancelQueries( { queryKey } );
        setLoadingTimedOut( true );
      }
    }, LOADING_TIMEOUT );

    // eslint-disable-next-line consistent-return
    return () => clearTimeout( timer );
  }, [infQueryResult.data, infQueryResult.isFetching, queryKey, queryClient] );

  // Reset when user manually retries
  useEffect( () => {
    if ( infQueryResult.isFetching ) {
      setLoadingTimedOut( false );
    }
  }, [infQueryResult.isFetching] );

  return {
    refetch: infQueryResult.refetch,
    isError: infQueryResult.isError,
    isFetching: infQueryResult.isFetching,
    isInitialLoading: infQueryResult.isInitialLoading,
    loadingTimedOut,
    // Disable fetchNextPage if signed out
    fetchNextPage: currentUser
      ? infQueryResult.fetchNextPage
      : ( ) => undefined,
    notifications: flatten( infQueryResult?.data?.pages ),
  };
};

export default useInfiniteNotificationsScroll;
