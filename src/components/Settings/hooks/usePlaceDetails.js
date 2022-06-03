import inatjs from "inaturalistjs";
import {useEffect, useState} from "react";
import {Alert} from "react-native";

const usePlaceDetails = ( placeId: string ): Array<Object> => {
  const [searchResult, setSearchResult] = useState( null );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchSearchResults = async ( ) => {
      try {
        const response = await inatjs.places.fetch( placeId, {fields: "display_name"} );
        const result = response.results[0];
        if ( !isCurrent ) { return; }
        setSearchResult( result );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.error( e );
        Alert.alert(
          "Error",
          "Couldn't retrieve place details!",
          [{ text: "OK" }],
          {
            cancelable: true
          }
        );
      }
    };

    // don't bother to fetch search results if there isn't a query
    if ( !placeId ) { return; }
    fetchSearchResults( );
    return ( ) => {
      isCurrent = false;
    };
  }, [placeId] );

  return searchResult;
};

export default usePlaceDetails;
