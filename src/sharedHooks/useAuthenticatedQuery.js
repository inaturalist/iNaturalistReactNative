// @flow
import { useQuery } from "@tanstack/react-query";

import { getJWTToken } from "../components/LoginSignUp/AuthenticationService";

const useAuthenticatedQuery = (
  queryKey: string,
  query: Function
): any => useQuery( [queryKey], async ( ) => {
  const apiToken = await getJWTToken( );
  const options = {
    api_token: apiToken
  };
  return query( options );
} );

export default useAuthenticatedQuery;
