import { useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { reactQueryRetry } from "sharedHelpers/logging";

// Should work like React Query's useQuery with our custom reactQueryRetry
const useNonAuthenticatedQuery = (
  queryKey: Array<string>,
  queryFunction: Function,
  queryOptions: Object = {}
): Object => {
  const route = useRoute( );

  return useQuery( {
    queryKey: [...queryKey, queryOptions.allowAnonymousJWT],
    queryFn: queryFunction,
    retry: ( failureCount, error ) => reactQueryRetry( failureCount, error, {
      queryKey,
      routeName: route?.name,
      routeParams: route?.params
    } ),
    ...queryOptions
  } );
};

export default useNonAuthenticatedQuery;
