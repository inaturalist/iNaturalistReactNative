import type { TFunction } from "i18next";
import type { ExploreV2LocationState } from "providers/ExploreV2Context";
import { EXPLORE_V2_PLACE_MODE } from "providers/ExploreV2Context";

function locationLabel( location: ExploreV2LocationState, t: TFunction ): string {
  switch ( location.placeMode ) {
    case EXPLORE_V2_PLACE_MODE.WORLDWIDE:
      return t( "Worldwide" );
    case EXPLORE_V2_PLACE_MODE.NEARBY:
      return t( "Nearby" );
    case EXPLORE_V2_PLACE_MODE.PLACE:
      return location.place.display_name || "";
    case EXPLORE_V2_PLACE_MODE.MAP_AREA:
      return t( "Map-Area" );
    default: {
      // Exhaustiveness check: ts fails if a new placeMode is added without a case.
      const _exhaustive: never = location;
      return _exhaustive;
    }
  }
}

export default locationLabel;
