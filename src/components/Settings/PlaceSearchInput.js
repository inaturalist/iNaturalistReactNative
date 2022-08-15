import React, { useEffect } from "react";
import {
  Image, Text, TextInput, View
} from "react-native";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import { useDebounce } from "use-debounce";

import inatPlaceTypes from "../../dictionaries/places";
import { textStyles, viewStyles } from "../../styles/settings/settings";
import usePlaceDetails from "./hooks/usePlaceDetails";
import usePlaces from "./hooks/usePlaces";

const PlaceSearchInput = ( { placeId, onPlaceChanged } ): React.Node => {
  const [hideResults, setHideResults] = React.useState( true );
  const [placeSearch, setPlaceSearch] = React.useState( "" );
  // So we'll start searching only once the user finished typing
  const [finalPlaceSearch] = useDebounce( placeSearch, 500 );
  const placeResults = usePlaces( finalPlaceSearch );
  const placeDetails = usePlaceDetails( placeId );

  useEffect( () => {
    if ( placeDetails ) {
      console.log( "Place details", placeDetails );
      setPlaceSearch( placeDetails.display_name );
    } else {
      setPlaceSearch( "" );
    }
  }, [placeDetails] );

  return (
    <View style={viewStyles.column}>
      <View style={viewStyles.row}>
        <TextInput
          style={viewStyles.textInput}
          onChangeText={v => {
            setHideResults( false );
            setPlaceSearch( v );
          }}
          value={placeSearch}
        />
        <Pressable
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
            source={require( "../../images/clear.png" )}
          />
        </Pressable>
      </View>
      {!hideResults && finalPlaceSearch.length > 0 && placeResults.map( place => (
        <Pressable
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
