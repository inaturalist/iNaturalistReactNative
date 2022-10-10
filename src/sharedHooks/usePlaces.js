import inatjs from "inaturalistjs";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

const usePlaces = ( q: string ): Array<Object> => {
  const [searchResults, setSearchResults] = useState( [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const cleanUp = ( ) => {
      isCurrent = false;
    };
    const fetchSearchResults = async ( ) => {
      try {
        const params = {
          per_page: 10,
          q,
          sources: "places",
          fields: "place,place.display_name,place.place_type"
        };
        const response = await inatjs.search( params );
        const { results } = response;
        if ( !isCurrent ) { return; }
        setSearchResults( results.map( r => r.place ) );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.error( e );
        Alert.alert(
          "Error",
          "Couldn't retrieve places!",
          [{ text: "OK" }],
          {
            cancelable: true
          }
        );
      }
    };

    // don't bother to fetch search results if there isn't a query
    if ( q === "" ) { return cleanUp; }
    fetchSearchResults( );
    return cleanUp;
  }, [q] );

  return searchResults;
};

export default usePlaces;
