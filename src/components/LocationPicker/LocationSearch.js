// @flow

import { useQueryClient } from "@tanstack/react-query";
import fetchSearchResults from "api/search";
import {
  Body3,
  SearchBar
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { Keyboard } from "react-native";
import { useTheme } from "react-native-paper";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

type Props = {
  region: Object,
  setRegion: Function,
  locationName: ?string,
  setLocationName: Function,
  getShadow: Function
};

const LocationSearch = ( {
  region, setRegion, locationName, setLocationName, getShadow
}: Props ): Node => {
  const [hideResults, setHideResults] = useState( false );
  const theme = useTheme( );
  const queryClient = useQueryClient( );

  // this seems necessary for clearing the cache between searches
  queryClient.invalidateQueries( ["fetchSearchResults"] );

  const {
    data: placeResults
  } = useAuthenticatedQuery(
    ["fetchSearchResults", locationName],
    optsWithAuth => fetchSearchResults( {
      q: locationName,
      sources: "places",
      fields: "place,place.display_name,place.point_geojson"
    }, optsWithAuth )
  );

  return (
    <>
      <SearchBar
        handleTextChange={locationText => {
          setLocationName( locationText );
          setHideResults( false );
        }}
        value={locationName}
        testID="LocationPicker.locationSearch"
        containerClass="absolute top-[20px] right-[26px] left-[26px]"
        hasShadow
      />
      <View
        className="absolute top-[65px] right-[26px] left-[26px] bg-white rounded-lg z-50"
        style={getShadow( theme.colors.primary )}
      >
        {!hideResults && placeResults?.map( place => (
          <Pressable
            accessibilityRole="button"
            key={place.id}
            className="p-2 border-[0.5px] border-lightGray"
            onPress={( ) => {
              setHideResults( true );
              setLocationName( place.display_name );
              const { coordinates } = place.point_geojson;
              setRegion( {
                ...region,
                latitude: coordinates[1],
                longitude: coordinates[0]
              } );
              Keyboard.dismiss( );
            }}
          >
            <Body3>{place.display_name}</Body3>
          </Pressable>
        ) )}
      </View>
    </>
  );
};

export default LocationSearch;
