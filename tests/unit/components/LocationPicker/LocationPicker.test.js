import { faker } from "@faker-js/faker";
import { fireEvent, screen } from "@testing-library/react-native";
import LocationPicker from "components/LocationPicker/LocationPicker";
import initI18next from "i18n/initI18next";
import { ObsEditContext } from "providers/contexts";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const observations = [
  factory( "RemoteObservation", {
  // Oakland, CA latlng
    latitude: 37.804855,
    longitude: -122.272504
  } )
];

const mockPlaceResult = factory( "RemotePlace", {
  display_name: "New York",
  point_geojson: {
    coordinates: [
      Number( faker.address.longitude( ) ),
      Number( faker.address.latitude( ) )
    ]
  }
} );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: [mockPlaceResult]
  } )
} ) );

const mockSelectPlaceResult = jest.fn( );
const mockRegion = {
  latitude: observations[0].latitude,
  longitude: observations[0].longitude,
  latitudeDelta: 0.2,
  longitudeDelta: 0.2
};

const renderLocationPicker = region => renderComponent(
  <ObsEditContext.Provider value={{
    updateObservationKeys: jest.fn( )
  }}
  >
    <LocationPicker
      region={region}
      locationName="Oakland, CA"
      updateLocationName={location => jest.fn( location )}
      hidePlaceResults={false}
      selectPlaceResult={mockSelectPlaceResult}
      mapType="standard"
      loading={false}
    />
  </ObsEditContext.Provider>
);

describe( "LocationPicker", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it(
    "should display latitude corresponding with location name",
    async ( ) => {
      renderLocationPicker( mockRegion );
      await screen.findByText( new RegExp( observations[0].latitude ) );
    }
  );

  it(
    "should show search results when a user changes search text",
    async ( ) => {
      renderLocationPicker( mockRegion );
      const input = screen.getByTestId( "LocationPicker.locationSearch" );
      expect( input ).toBeVisible( );
      await screen.findByText( new RegExp( observations[0].latitude ) );
      fireEvent.changeText( input, "New" );
      await screen.findByText( mockPlaceResult.display_name );
    }
  );

  it(
    "should update map with new place results when a user taps a place in dropdown",
    async ( ) => {
      renderLocationPicker( mockRegion );
      const input = screen.getByTestId( "LocationPicker.locationSearch" );
      await screen.findByText( new RegExp( observations[0].latitude ) );
      fireEvent.changeText( input, "New" );
      const placeResult = screen.getByText( mockPlaceResult.display_name );
      expect( placeResult ).toBeVisible( );
      fireEvent.press( placeResult );
      expect( mockSelectPlaceResult ).toHaveBeenCalledTimes( 1 );
      renderLocationPicker( {
        ...mockRegion,
        latitude: mockPlaceResult.point_geojson.coordinates[1],
        longitude: mockPlaceResult.point_geojson.coordinates[0]
      } );
      await screen.findByText(
        new RegExp( mockPlaceResult.point_geojson.coordinates[0] )
      );
    }
  );

  it( "should not have a minimum zoom level", async ( ) => {
    renderLocationPicker( mockRegion );
    const map = screen.getByTestId( "LocationPicker.Map" );
    expect( map ).not.toHaveProp( "minZoomLevel" );
  } );
} );
