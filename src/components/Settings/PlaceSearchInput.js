import { useQueryClient } from "@tanstack/react-query";
import fetchPlace from "api/places";
import fetchSearchResults from "api/search";
import inatPlaceTypes from "dictionaries/places";
import React, { useEffect } from "react";
import {
  Image, Text, TextInput, View
} from "react-native";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import { textStyles, viewStyles } from "styles/settings/settings";
import { useDebounce } from "use-debounce";

const PlaceSearchInput = ( { placeId, onPlaceChanged } ): React.Node => {
  const [hideResults, setHideResults] = React.useState( true );
  const [placeSearch, setPlaceSearch] = React.useState( "" );
  // So we'll start searching only once the user finished typing
  const [finalPlaceSearch] = useDebounce( placeSearch, 500 );

  const queryClient = useQueryClient( );

  // this seems necessary for clearing the cache between searches
  queryClient.invalidateQueries( ["fetchSearchResults"] );

  const {
    data: placeResults
  } = useAuthenticatedQuery(
    ["fetchSearchResults", finalPlaceSearch],
    optsWithAuth => fetchSearchResults( {
      q: finalPlaceSearch,
      sources: "places",
      fields: "place,place.display_name,place.place_type"
    }, optsWithAuth )
  );

  const {
    data: placeDetails
  } = useAuthenticatedQuery(
    ["fetchPlace", placeId],
    optsWithAuth => fetchPlace( placeId, optsWithAuth )
  );

  useEffect( () => {
    if ( placeDetails ) {
      setPlaceSearch( placeDetails.display_name );
    } else {
      setPlaceSearch( "" );
    }
  }, [placeDetails] );

  return (
    <View style={viewStyles.column}>
      <View style={viewStyles.row}>
        <TextInput
          accessibilityLabel="Text input field"
          style={viewStyles.textInput}
          onChangeText={v => {
            setHideResults( false );
            setPlaceSearch( v );
          }}
          value={placeSearch}
        />
        <Pressable
          accessibilityRole="button"
          style={viewStyles.clearSearch}
          onPress={() => {
            setHideResults( true );
            setPlaceSearch( "" );
            onPlaceChanged( 0 );
          }}
        >
          <Image
            style={viewStyles.clearSearch}
            resizeMode="contain"
            source={require( "images/clear.png" )}
            accessibilityIgnoresInvertColors
          />
        </Pressable>
      </View>
      {!hideResults && finalPlaceSearch.length > 0 && placeResults?.map( place => (
        <Pressable
          accessibilityRole="button"
          key={place.id}
          style={[viewStyles.row, viewStyles.placeResultContainer]}
          onPress={() => {
            setHideResults( true );
            onPlaceChanged( place.id );
          }}
        >
          <Text style={textStyles.resultPlaceName}>{place.display_name}</Text>
          <Text style={textStyles.resultPlaceType}>{inatPlaceTypes[place.place_type]}</Text>
        </Pressable>
      ) )}
    </View>
  );
};

export default PlaceSearchInput;
