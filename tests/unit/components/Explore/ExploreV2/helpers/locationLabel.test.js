import locationLabel from "components/Explore/ExploreV2/helpers/locationLabel";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import { EXPLORE_V2_PLACE_MODE } from "providers/ExploreV2Context";

beforeAll( async ( ) => {
  await initI18next( );
} );

describe( "locationLabel", ( ) => {
  it.each( [
    ["worldwide", { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE }, "Worldwide"],
    ["nearby", { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY }, "Nearby"],
    [
      "a map area",
      {
        placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA,
        bounds: {
          swlat: 1, swlng: 2, nelat: 3, nelng: 4,
        },
      },
      "Map Area",
    ],
    [
      "a place with its display name",
      {
        placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
        place: { id: 1, display_name: "Monterey, CA, US" },
      },
      "Monterey, CA, US",
    ],
    [
      "a place without a display name as empty",
      { placeMode: EXPLORE_V2_PLACE_MODE.PLACE, place: { id: 1 } },
      "",
    ],
  ] )( "labels %s", ( _name, location, expected ) => {
    expect( locationLabel( location, i18next.t ) ).toEqual( expected );
  } );
} );
