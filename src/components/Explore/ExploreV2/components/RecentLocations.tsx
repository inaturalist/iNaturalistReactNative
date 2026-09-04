import LocationSearchResult
  from "components/Explore/ExploreV2/components/LocationSearchResult";
import { View } from "components/styledComponents";
import type { Place } from "providers/ExploreV2Context";
import React from "react";
import type { ExploreV2SearchesSlice } from "stores/createExploreV2SearchesSlice";
import useStore from "stores/useStore";

interface Props {
  onSelectPlace: ( _place: Place ) => void;
}

const RecentLocations = ( { onSelectPlace }: Props ) => {
  const places = useStore(
    ( state: ExploreV2SearchesSlice ) => state.exploreRecentSearches.places,
  );

  if ( places.length === 0 ) { return null; }

  return (
    <View testID="RecentLocations">
      {places.map( ( place: Place ) => (
        <LocationSearchResult
          key={place.id}
          onPress={( ) => onSelectPlace( place )}
          place={{
            type: "place",
            id: place.id,
            display_name: place.display_name ?? "",
            place_type: place.place_type ?? null,
          }}
        />
      ) )}
    </View>
  );
};

export default React.memo( RecentLocations );
