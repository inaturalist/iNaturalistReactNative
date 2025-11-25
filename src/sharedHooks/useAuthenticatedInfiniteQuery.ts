import { useRoute } from "@react-navigation/native";
import { QueryKey, useInfiniteQuery, UseInfiniteQueryOptions } from "@tanstack/react-query";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import i18n from "i18next";
import { handleRetryDelay, reactQueryRetry } from "sharedHelpers/logging";
import { useCurrentUser } from "sharedHooks";

interface QueryFunctionOptions {
  api_token: string | null;
  locale?: string;
}

type QueryFunction<T> = ( params: {
  pageParam: number,
  locale?: string
}, options: QueryFunctionOptions ) => Promise<T>;

type QueryOptions<TQueryFnData, TData> = Omit<UseInfiniteQueryOptions<
  TQueryFnData,
  Error,
  TData,
  TQueryFnData,
  QueryKey,
  number
>, "queryKey"> & {
  allowAnonymousJWT?: boolean;
}

// Should work like React Query's useInfiniteQuery with our custom reactQueryRetry
// and authentication
const useAuthenticatedInfiniteQuery = <TQueryFnData, TData>(
  queryKey: QueryKey,
  queryFunction: QueryFunction<TQueryFnData>,
  queryOptions: QueryOptions<TQueryFnData, TData>
) => {
  const route = useRoute( );
  const currentUser = useCurrentUser( );

  // Use locale in case there is no user session
  const locale = i18n?.language ?? "en";

  return useInfiniteQuery( {
    queryKey: [...queryKey, queryOptions.allowAnonymousJWT, currentUser, locale],
    queryFn: async ( { pageParam } ) => {
      const params = {
        pageParam,
        ...( !currentUser && { locale } )
      };
      // logger.info( queryKey, "queryKey in useAuthenticatedInfiniteQuery" );
      // Note, getJWT() takes care of fetching a new token if the existing
      // one is expired. We *could* store the token in state with useState if
      // fetching from RNSInfo becomes a performance issue
      const apiToken = await getJWT( queryOptions.allowAnonymousJWT );
      const options = {
        api_token: apiToken
      };
      return queryFunction( params, options );
    },
    retry: ( failureCount, error ) => reactQueryRetry( failureCount, error, {
      queryKey,
      routeName: route?.name,
      routeParams: route?.params
    } ),
    retryDelay: ( failureCount, error ) => handleRetryDelay( failureCount, error ),
    ...queryOptions
  } );
};

export default useAuthenticatedInfiniteQuery;
