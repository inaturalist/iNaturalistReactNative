import { screen } from "@testing-library/react-native";
import { ObservationLocation } from "components/SharedComponents";
import initializeI18next from "i18n";
import React from "react";

import factory from "../../../factory";
import { renderAppWithComponent } from "../../../helpers/render";

describe( "ObservationLocation", () => {
  beforeAll( async ( ) => {
    await initializeI18next( );
  } );

  it( "should be accessible", () => {
    const mockObservation = factory( "RemoteObservation" );
    expect(
      <ObservationLocation observation={mockObservation} />
    ).toBeAccessible();
  } );

  it( "should format location correctly from place_guess", async ( ) => {
    const mockObservation = factory( "RemoteObservation", {
      latitude: 30.18183,
      longitude: -85.760449,
      place_guess: "Panama City Beach, Florida"
    } );

    renderAppWithComponent(
      <ObservationLocation observation={mockObservation} />
    );
    expect( await screen.findByText( mockObservation.place_guess ) ).toBeTruthy();
  } );

  it( "should format location correctly from latitude/longitude", async ( ) => {
    const mockObservation = factory( "RemoteObservation", {
      latitude: 30.18183,
      longitude: -85.760449,
      place_guess: null
    } );

    renderAppWithComponent(
      <ObservationLocation observation={mockObservation} />
    );
    expect( await screen.findByText(
      `${mockObservation.latitude}, ${mockObservation.longitude}`
    ) ).toBeTruthy();
  } );

  it( "should show no location if unknown", async ( ) => {
    const mockObservation = factory( "RemoteObservation", {
      latitude: null,
      longitude: null,
      place_guess: null
    } );

    renderAppWithComponent(
      <ObservationLocation observation={mockObservation} />
    );
    expect( await screen.findByText(
      "Missing Location"
    ) ).toBeTruthy();
  } );
} );
