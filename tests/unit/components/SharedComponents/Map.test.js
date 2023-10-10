import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import { Map } from "components/SharedComponents";
import React from "react";

import { renderComponent } from "../../../helpers/render";

const mockNavigate = jest.fn( );
jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      navigate: mockNavigate
    } )
  };
} );

describe( "Map", ( ) => {
  it( "should be accessible", ( ) => {
    expect( <Map /> ).toBeAccessible( );
  } );

  it( "displays filtered observations on map", async ( ) => {
    renderComponent(
      <Map
        withObsTiles
        tileMapParams={{ taxon_id: 47178 }}
      />
    );
    const tiles = await screen.findByTestId( "Map.UrlTile" );
    expect( tiles ).toHaveProp( "urlTemplate", "https://api.inaturalist.org/v2/grid/{z}/{x}/{y}.png?taxon_id=47178&color=%2374ac00&verifiable=true" );
  } );

  it( "displays location indicator when given an observation lat/lng", async ( ) => {
    renderComponent(
      <Map
        showLocationIndicator
        obsLatitude={Number( faker.address.latitude( ) )}
        obsLongitude={Number( faker.address.longitude( ) )}
      />
    );
    expect( screen.getByTestId( "Map.LocationMarkerImage" ).props.source )
      .toStrictEqual( require( "images/location_indicator.png" ) );
  } );
} );
