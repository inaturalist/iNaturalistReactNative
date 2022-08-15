import inatjs from "inaturalistjs";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

const useRelationships = ( accessToken, {
  following,
  order,
  order_by, // eslint-disable-line camelcase
  page,
  per_page, // eslint-disable-line camelcase
  q,
  random,
  trusted
} ): Array<Object> => {
  const [searchResults, setSearchResults] = useState( [] );
  const [perPage, setPerPage] = useState( 0 );
  const [totalResults, setTotalResults] = useState( 0 );

  useEffect( ( ) => {
    let isCurrent = true;
    const cleanUp = ( ) => {
      isCurrent = false;
    };
    const fetchSearchResults = async ( ) => {
      try {
        const response = await inatjs.relationships.search( {
          q,
          following,
          trusted,
          order_by,
          order,
          per_page,
          page,
          fields: "all"
        }, { api_token: accessToken } );
        const { results } = response;
        if ( !isCurrent ) { return; }
        setSearchResults( results );
        setPerPage( response.per_page );
        setTotalResults( response.total_results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.error( e );
        Alert.alert(
          "Error",
          "Couldn't retrieve relationships!",
          [{ text: "OK" }],
          {
            cancelable: true
          }
        );
      }
    };

    // don't bother to fetch search results if there isn't a query
    if ( !accessToken ) { return cleanUp; }
    fetchSearchResults( );
    return cleanUp;
  }, [
    accessToken,
    following,
    order,
    order_by, // eslint-disable-line camelcase
    page,
    per_page, // eslint-disable-line camelcase
    q,
    random,
    trusted
  ] );

  return [searchResults, perPage, totalResults];
};

export default useRelationships;
