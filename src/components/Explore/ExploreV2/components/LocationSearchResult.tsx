import Body1 from "components/SharedComponents/Typography/Body1";
import List2 from "components/SharedComponents/Typography/List2";
import { Pressable, View } from "components/styledComponents";
import inatPlaceTypes from "dictionaries/places";
import React from "react";
import type { LocationSearchResultItem } from "sharedHooks/useLocationSearch";

interface Props {
  place: LocationSearchResultItem;
  onPress: ( ) => void;
}

const LocationSearchResult = ( { place, onPress }: Props ) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={place.display_name}
    className="h-[64px] justify-center px-[15px] border-b border-lightGray"
    onPress={onPress}
    testID={`LocationSearchResult.${place.id}`}
  >
    <Body1>{place.display_name}</Body1>
    {!!place.place_type && (
      <View className="mt-[5px]">
        <List2>{inatPlaceTypes[place.place_type]}</List2>
      </View>
    )}
  </Pressable>
);

export default LocationSearchResult;
