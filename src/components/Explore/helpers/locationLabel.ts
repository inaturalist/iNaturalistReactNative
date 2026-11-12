import type { TFunction } from "i18next";
import type { ExploreLocationState } from "providers/ExploreContext";
import { EXPLORE_PLACE_MODE } from "providers/ExploreContext";

function locationLabel( location: ExploreLocationState, t: TFunction ): string {
  switch ( location.placeMode ) {
    case EXPLORE_PLACE_MODE.WORLDWIDE:
      return t( "Worldwide" );
    case EXPLORE_PLACE_MODE.NEARBY:
      return t( "Nearby" );
    case EXPLORE_PLACE_MODE.PLACE:
      return location.place.display_name || "";
    case EXPLORE_PLACE_MODE.MAP_AREA:
      return t( "Map-Area" );
    default: {
      // Exhaustiveness check: ts fails if a new placeMode is added without a case.
      const _exhaustive: never = location;
      return _exhaustive;
    }
  }
}

export default locationLabel;
