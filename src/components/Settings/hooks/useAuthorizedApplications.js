import inatjs from "inaturalistjs";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

const useAuthorizedApplications = ( accessToken: string ): Array<Object> => {
  const [searchResults, setSearchResults] = useState( [] );

  useEffect( () => {
    let isCurrent = true;
    const cleanUp = ( ) => {
      isCurrent = false;
    };
    const fetchSearchResults = async () => {
      try {
        const response = await inatjs.authorized_applications.search(
          { fields: "application.official,application.name,created_at" },
          { api_token: accessToken }
        );
        const { results } = response;
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
          "Couldn't retrieve authorized applications!",
          [{ text: "OK" }],
          {
            cancelable: true
          }
        );
      }
    };

    // don't bother to fetch search results if there isn't a query
    if ( !accessToken ) {
      return cleanUp;
    }
    fetchSearchResults();
    return cleanUp;
  }, [accessToken] );

  return searchResults;
};

export default useAuthorizedApplications;
