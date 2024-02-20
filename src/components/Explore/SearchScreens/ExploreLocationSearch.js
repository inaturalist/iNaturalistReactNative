// @flow

import { useNavigation } from "@react-navigation/native";
import fetchSearchResults from "api/search";
import {
  Body3,
  SearchBar,
  ViewWrapper
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import inatPlaceTypes from "dictionaries/places";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { FlatList } from "react-native";
import { useTheme } from "react-native-paper";
import { useAuthenticatedQuery } from "sharedHooks";
import { getShadowStyle } from "styles/global";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 4,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

const ExploreLocationSearch = ( ): Node => {
  const theme = useTheme();
  const navigation = useNavigation();

  const [locationName, setLocationName] = useState( "" );

  const { data: placeResults } = useAuthenticatedQuery(
    ["fetchSearchResults", locationName],
    optsWithAuth => fetchSearchResults(
      {
        q: locationName,
        sources: "places",
        fields:
            "place,place.display_name,place.point_geojson,place.place_type",
        per_page: 50
      },
      optsWithAuth
    ),
    {
      enabled: locationName.length > 0
    }
  );

  const onPlaceSelected = useCallback(
    place => {
      navigation.navigate( "Explore", { place } );
    },
    [navigation]
  );

  const renderItem = useCallback(
    ( { item: place } ) => (
      <Pressable
        accessibilityRole="button"
        key={place.id}
        className="p-2 border-[0.5px] border-lightGray"
        onPress={() => onPlaceSelected( place )}
      >
        <Body3>{place.display_name}</Body3>
        {!!place.place_type && (
          <Body3>{inatPlaceTypes[place.place_type]}</Body3>
        )}
      </Pressable>
    ),
    [onPlaceSelected]
  );

  const data = placeResults || [];

  return (
    <ViewWrapper testID="explore-location-search" className="flex-1">
      <View
        className="bg-white px-6 pt-2 pb-8"
        style={getShadow( theme.colors.primary )}
      >
        <SearchBar
          handleTextChange={locationText => setLocationName( locationText )}
          value={locationName}
          testID="LocationPicker.locationSearch"
        />
      </View>
      <FlatList
        keyboardShouldPersistTaps="always"
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </ViewWrapper>
  );
};

export default ExploreLocationSearch;
