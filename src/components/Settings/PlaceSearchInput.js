import React, {useEffect} from "react";
import {useDebounce} from "use-debounce";
import inatjs from "inaturalistjs";
import {Image, Text, TextInput, View} from "react-native";
import {textStyles, viewStyles} from "../../styles/settings/settings";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import {inatPlaceTypes} from "../../dictionaries/places";

const PlaceSearchInput = ( { placeId, onPlaceChanged} ): React.Node => {
  const [hideResults, setHideResults] = React.useState( true );
  const [placeResults, setPlaceResults] = React.useState( [] );
  const [placeSearch, setPlaceSearch] = React.useState( "" );
  // So we'll start searching only once the user finished typing
  const [finalPlaceSearch] = useDebounce( placeSearch, 500 );

  useEffect( () => {
    async function findPlaces() {
      const response = await inatjs.places.autocomplete( { q: finalPlaceSearch} );
      console.log( response );
      setPlaceResults( response.results );
    }
    findPlaces();
  }, [finalPlaceSearch] );

  useEffect( () => {
    async function getPlaceDetails() {
      // Get place details
      const response = await inatjs.places.fetch( placeId );
      console.log( "Place details", response );
      setPlaceSearch( response.results[0].display_name );
    }
    if ( placeId ) {
      getPlaceDetails();
    } else {
      setPlaceSearch( "" );
    }

  }, [placeId] );

  return  (
    <View style={viewStyles.column}>
      <View style={viewStyles.row}>
        <TextInput
          style={viewStyles.textInput}
          onChangeText={( v ) => {
            setHideResults( false );
            setPlaceSearch( v );
          }}
          value={placeSearch}
        />
        <Pressable style={viewStyles.clearSearch} onPress={() => {
          setHideResults( true );
          onPlaceChanged( 0 );
        }}>
          <Image
            style={viewStyles.clearSearch}
            resizeMode="contain"
            source={require( "../../images/clear.png" )}
          />
        </Pressable>
      </View>
      {!hideResults && finalPlaceSearch.length > 0 && placeResults.map( ( place ) => (
        <Pressable key={place.id} style={[viewStyles.row, viewStyles.placeResultContainer]}
                   onPress={() => {
                     setHideResults( true );
                     onPlaceChanged( place.id );
                   }}>
          <Text style={textStyles.resultPlaceName}>{place.display_name}</Text>
          <Text style={textStyles.resultPlaceType}>{inatPlaceTypes[place.place_type]}</Text>
        </Pressable>
      ) )}
    </View>
  );

};

export default PlaceSearchInput;
