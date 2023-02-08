import { screen } from "@testing-library/react-native";
import { ObservationLocation } from "components/SharedComponents";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockLocationName = "San Francisco, CA";

jest.mock( "sharedHooks/useLocationName", () => ( {
  __esModule: true,
  default: () => mockLocationName
} ) );

describe( "ObservationLocation", () => {
  it( "should be accessible", () => {
    const mockObservation = factory( "RemoteObservation" );
    expect(
      <ObservationLocation observation={mockObservation} />
    ).toBeAccessible();
  } );

  it( "should format location correctly from place_guess", () => {
    const mockObservation = factory( "RemoteObservation", {
      latitude: 30.18183,
      longitude: -85.760449,
      place_guess: "Panama City Beach, Florida"
    } );

    renderComponent(
      <ObservationLocation observation={mockObservation} />
    );
    expect( screen.getByText( mockObservation.place_guess ) ).toBeTruthy();
  } );

  it( "should format location correctly from latitude/longitude", () => {
    const mockObservation = factory( "RemoteObservation", {
      latitude: 30.18183,
      longitude: -85.760449,
      place_guess: null
    } );

    renderComponent(
      <ObservationLocation observation={mockObservation} />
    );
    expect( screen.getByText(
      `${mockObservation.latitude}, ${mockObservation.longitude}`
    ) ).toBeTruthy();
  } );

  it( "should show no location if unknown", () => {
    const mockObservation = factory( "RemoteObservation", {
      latitude: null,
      longitude: null,
      place_guess: null
    } );

    renderComponent(
      <ObservationLocation observation={mockObservation} />
    );
    expect( screen.getByText(
      "Missing Location"
    ) ).toBeTruthy();
  } );
} );
