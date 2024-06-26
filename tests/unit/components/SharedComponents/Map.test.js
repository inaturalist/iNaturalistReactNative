import { screen } from "@testing-library/react-native";
import { Map } from "components/SharedComponents";
import { TILE_URL } from "components/SharedComponents/Map/helpers/mapHelpers.ts";
import React from "react";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const baseUrl = `${TILE_URL}/grid/{z}/{x}/{y}.png`;

describe( "Map", ( ) => {
  it( "should be accessible", ( ) => {
    expect( <Map /> ).toBeAccessible( );
  } );

  it( "displays filtered observations on map", async ( ) => {
    const taxonId = 1234;
    renderComponent(
      <Map
        withPressableObsTiles
        tileMapParams={{ taxon_id: taxonId }}
      />
    );
    const tiles = await screen.findByTestId( "Map.UrlTile" );
    const { urlTemplate } = tiles.props;
    expect( urlTemplate )
      .toMatch( new RegExp( `^${baseUrl}.*taxon_id=${taxonId}` ) );
  } );

  it( "displays location indicator when given an observation lat/lng", async ( ) => {
    renderComponent(
      <Map
        showLocationIndicator
        obsLatitude={Number( faker.location.latitude( ) )}
        obsLongitude={Number( faker.location.longitude( ) )}
      />
    );
    const testId = "Map.LocationIndicator";
    expect( screen.getByTestId( testId ) ).toBeTruthy();
  } );
} );
