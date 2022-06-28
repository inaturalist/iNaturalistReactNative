import inatjs from "inaturalistjs";
import { useEffect, useState } from "react";
import {Alert} from "react-native";

const useProviderAuthorizations = ( accessToken: string ): Array<Object> => {
  const [searchResults, setSearchResults] = useState( [] );

  useEffect( () => {
    let isCurrent = true;
    const fetchSearchResults = async () => {
      try {
        const response = await inatjs.provider_authorizations.search(
          { fields: "provider_name,created_at" },
          { api_token: accessToken }
        );
        const results = response.results;
        if ( !isCurrent ) {
          return;
        }
        setSearchResults( results );
      } catch ( e ) {
        if ( !isCurrent ) {
          return;
        }
        console.error( e );
        Alert.alert(
          "Error",
          "Couldn't retrieve provider authorizations!",
          [{ text: "OK" }],
          {
            cancelable: true
          }
        );
      }
    };

    // don't bother to fetch search results if there isn't a query
    if ( !accessToken ) {
      return;
    }
    fetchSearchResults();
    return () => {
      isCurrent = false;
    };
  }, [accessToken] );

  return searchResults;
};

export default useProviderAuthorizations;
