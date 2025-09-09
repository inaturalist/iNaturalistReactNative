import { PLACE_MODE } from "providers/ExploreContext";

// eslint-disable-next-line max-len
function placeGuessText( placeMode: PLACE_MODE, t: ( _key: string ) => string, exploreStatePlaceGuess: string ): string {
  let placeGuess = "";
  switch ( placeMode ) {
    case PLACE_MODE.NEARBY:
      placeGuess = t( "Nearby" );
      break;
    case PLACE_MODE.WORLDWIDE:
      placeGuess = t( "Worldwide" );
      break;
    case PLACE_MODE.MAP_AREA:
      placeGuess = t( "Map-Area" );
      break;
    case PLACE_MODE.PLACE:
      placeGuess = exploreStatePlaceGuess;
      break;
    default:
      break;
  }
  return placeGuess;
}

export default placeGuessText;
