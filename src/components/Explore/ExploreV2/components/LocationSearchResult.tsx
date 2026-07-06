import type { LocationSearchResultItem }
  from "components/Explore/ExploreV2/hooks/useLocationSearch";
import Body1 from "components/SharedComponents/Typography/Body1";
import List2 from "components/SharedComponents/Typography/List2";
import { Pressable, View } from "components/styledComponents";
import inatPlaceTypes from "dictionaries/places";
import React from "react";

interface Props {
  place: LocationSearchResultItem;
  onPress: ( ) => void;
}

const LocationSearchResult = ( { place, onPress }: Props ) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={place.display_name}
    className="min-h-[64px] justify-center py-[11px] px-[15px] border-b border-lightGray"
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
