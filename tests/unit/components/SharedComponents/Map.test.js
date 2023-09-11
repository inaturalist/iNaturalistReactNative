import { faker } from "@faker-js/faker";
import { fireEvent, screen } from "@testing-library/react-native";
import { Map } from "components/SharedComponents";
import React from "react";

import factory from "../../../factory";
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

const mockObservations = [
  factory( "RemoteObservation", {
    latitude: Number( faker.address.latitude( ) ),
    longitude: Number( faker.address.longitude( ) )
  } ),
  factory( "RemoteObservation", {
    latitude: Number( faker.address.latitude( ) ),
    longitude: Number( faker.address.longitude( ) )
  } )
];

describe( "Map", ( ) => {
  it( "should be accessible", ( ) => {
    expect( <Map /> ).toBeAccessible( );
  } );

  it( "displays all observations on map", async ( ) => {
    renderComponent( <Map observations={mockObservations} /> );
    await screen.findByTestId( `ExploreMap.TaxonMarker.${mockObservations[0].uuid}` );
    await screen.findByTestId( `ExploreMap.TaxonMarker.${mockObservations[1].uuid}` );
  } );

  it( "navigates to observation details when observation marker is pressed", async ( ) => {
    renderComponent( <Map observations={mockObservations} /> );
    fireEvent.press(
      await screen.findByTestId(
        `ExploreMap.TaxonMarker.${mockObservations[0].uuid}`
      )
    );
    expect( mockNavigate ).toHaveBeenCalledWith( "ObsDetails", {
      uuid: mockObservations[0].uuid
    } );
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
