import { screen } from "@testing-library/react-native";
import MapSection from "components/ObsDetailsDefaultMode/MapSection/MapSection";
import { TILE_URL } from "components/SharedComponents/Map/helpers/mapHelpers";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

// Before migrating to Jest 27 this line was:
// jest.useFakeTimers();
// TODO: replace with modern usage of jest.useFakeTimers
// jest.useFakeTimers( {
//   legacyFakeTimers: true
// } );

const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  latitude: Number( faker.location.latitude( ) ),
  longitude: Number( faker.location.longitude( ) ),
  description: faker.lorem.paragraph( ),
  quality_grade: "casual",
} );

const mockObservationWithTaxon = {
  ...mockObservation,
  taxon: factory( "LocalTaxon" ),
};

const baseUrl = `${TILE_URL}/grid/{z}/{x}/{y}.png`;

describe( "MapSection", ( ) => {
  test( "should display map if user is online", ( ) => {
    renderComponent( <MapSection observation={mockObservation} /> );

    const map = screen.queryByTestId( "MapView" );
    expect( map ).toBeTruthy( );

    const noInternet = screen.queryByRole( "image", { name: "wifi-off" } );
    expect( noInternet ).toBeNull( );
  } );

  test( "should show tiles on map for given taxon", ( ) => {
    renderComponent( <MapSection observation={mockObservationWithTaxon} /> );

    const map = screen.queryByTestId( "MapView" );
    expect( map ).toBeTruthy( );

    const tiles = screen.getByTestId( "Map.UrlTile" );
    expect( tiles ).toBeVisible( );
    const { urlTemplate } = tiles.props;
    expect( urlTemplate )
      .toMatch( new RegExp( `^${baseUrl}.*taxon_id=${mockObservationWithTaxon.taxon.id}` ) );
  } );

  test( "should not show tiles for observation with no taxon id", ( ) => {
    renderComponent( <MapSection observation={mockObservation} /> );

    const map = screen.queryByTestId( "MapView" );
    expect( map ).toBeTruthy( );

    const tiles = screen.queryByTestId( "Map.UrlTile" );
    expect( tiles ).toBeFalsy( );
  } );
} );
