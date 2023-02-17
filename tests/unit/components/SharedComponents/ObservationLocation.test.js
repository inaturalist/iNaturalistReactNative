import { render, screen } from "@testing-library/react-native";
import { ObservationLocation } from "components/SharedComponents";
import initI18next from "i18n/initI18next";
import React from "react";

import factory from "../../../factory";

const latitude = 30.18183
const longitude = -85.760449

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
    `${latitude}, ${longitude}`
  ],
  [
    "should handle latitude/longitude w/ zero",
    {
      latitude: 0,
      longitude: 0,
      place_guess: null
    },
    "0, 0"
  ],
  [
    "should show no location if unknown",
    {
      latitude: null,
      longitude: null,
      place_guess: null
    },
    "Missing Location"
  ]
]

describe( "ObservationLocation", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "should be accessible", () => {
    const mockObservation = factory( "RemoteObservation" );
    expect(
      <ObservationLocation observation={mockObservation} />
    ).toBeAccessible();
  } );

  it.each(testData)('%s', async (a, obsData, expectedResult) => {
    const mockObservation = factory( "RemoteObservation", obsData );

    render(
      <ObservationLocation observation={mockObservation} />
    );
    expect( await screen.findByText( expectedResult ) ).toBeTruthy();
  });
});
