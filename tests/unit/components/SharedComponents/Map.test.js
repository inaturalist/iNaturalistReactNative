import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import { Map } from "components/SharedComponents";
import React from "react";
import { renderComponent } from "tests/helpers/render";

describe( "Map", ( ) => {
  it( "should be accessible", ( ) => {
    expect( <Map /> ).toBeAccessible( );
  } );

  it( "displays filtered observations on map", async ( ) => {
    renderComponent(
      <Map
        withPressableObsTiles
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
        obsLatitude={Number( faker.location.latitude( ) )}
        obsLongitude={Number( faker.location.longitude( ) )}
      />
    );
    const testId = "Map.LocationIndicator";
    expect( screen.getByTestId( testId ) ).toBeTruthy();
  } );
} );
