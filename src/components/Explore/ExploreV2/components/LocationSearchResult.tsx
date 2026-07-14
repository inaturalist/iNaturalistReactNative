import Body1 from "components/SharedComponents/Typography/Body1";
import List2 from "components/SharedComponents/Typography/List2";
import { Pressable, View } from "components/styledComponents";
import inatPlaceTypes from "dictionaries/places";
import React from "react";

interface Props {
  // Structurally minimal so both autocomplete results and stored recent
  // searches (which carry no place_type) can be rendered by this row.
  place: {
    id: number;
    display_name?: string;
    place_type?: number | null;
  };
  onPress: ( ) => void;
  // Overrides the place-type label under the name (e.g. "Recent Search").
  subtitle?: string;
}

const LocationSearchResult = ( { place, onPress, subtitle }: Props ) => {
  const subtitleText = subtitle
    ?? ( place.place_type
      ? inatPlaceTypes[place.place_type]
      : undefined );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={place.display_name}
      className="min-h-[64px] justify-center py-[11px] px-[15px] border-b border-lightGray"
      onPress={onPress}
      testID={`LocationSearchResult.${place.id}`}
    >
      <Body1>{place.display_name}</Body1>
      {!!subtitleText && (
        <View className="mt-[5px]">
          <List2>{subtitleText}</List2>
        </View>
      )}
    </Pressable>
  );
};

export default LocationSearchResult;
