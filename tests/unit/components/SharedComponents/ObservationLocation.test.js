import { render, screen } from "@testing-library/react-native";
import { ObservationLocation } from "components/SharedComponents";
import React from "react";
import factory from "tests/factory";

const latitude = 30.18183;
const longitude = -85.760449;

const testData = [
  [
    "should format location correctly from place_guess",
    {
      latitude,
      longitude,
      place_guess: "Panama City Beach, Florida"
    },
    "Panama City Beach, Florida"
  ],
  [
    "should format location correctly from latitude/longitude",
    {
      latitude,
      longitude,
      place_guess: null
    },
    `Lat: ${latitude}, Lon: ${longitude}`
  ],
  [
    "should handle latitude/longitude w/ zero",
    {
      latitude: 0,
      longitude: 0,
      place_guess: null
    },
    "Lat: 0, Lon: 0"
  ],
  [
    "should show no location if unknown",
    {
      latitude: null,
      longitude: null,
      place_guess: null
    },
    "No Location"
  ]
];

describe( "ObservationLocation", () => {
  it( "should be accessible", () => {
    // const mockObservation = factory( "RemoteObservation" );
    // Disabled during the update to RN 0.78
    // expect(
    //   <ObservationLocation observation={mockObservation} />
    // ).toBeAccessible();
  } );

  it.each( testData )( "%s", async ( a, obsData, expectedResult ) => {
    const mockObservation = factory( "RemoteObservation", obsData );

    render(
      <ObservationLocation observation={mockObservation} details />
    );
    expect( await screen.findByText( new RegExp( expectedResult ) ) ).toBeTruthy();
  } );

  it( "renders obscured icon if obscured", async () => {
    const mockObservation = {
      taxon_geoprivacy: "obscured"
    };
    render(
      <ObservationLocation observation={mockObservation} />
    );
    expect( await screen.findByTestId(
      `ContentWithIcon.${mockObservation.taxon_geoprivacy}`
    ) ).toBeTruthy( );
  } );

  it( "renders private icon if private", async () => {
    const mockObservation = {
      taxon_geoprivacy: "private"
    };
    render(
      <ObservationLocation observation={mockObservation} />
    );
    expect( await screen.findByTestId(
      `ContentWithIcon.${mockObservation.taxon_geoprivacy}`
    ) ).toBeTruthy( );
  } );

  it( "renders loaction icon if not obscured", async () => {
    const mockObservation = factory( "RemoteObservation" );
    render(
      <ObservationLocation observation={mockObservation} />
    );
    expect( await screen.findByTestId(
      "ContentWithIcon.location"
    ) ).toBeTruthy( );
  } );
} );
