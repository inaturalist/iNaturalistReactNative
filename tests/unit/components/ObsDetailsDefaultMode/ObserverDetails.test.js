import { screen } from "@testing-library/react-native";
import ObserverDetails from "components/ObsDetailsDefaultMode/ObserverDetails";
import i18next from "i18next";
import React from "react";
import { formatApiDatetime } from "sharedHelpers/dateAndTime";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockObservation = factory( "LocalObservation", {
  _created_at: faker.date.past( ),
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30"
} );

describe( "ObserverDetails", () => {
  it( "renders observed date of observation in header", async ( ) => {
    renderComponent( <ObserverDetails observation={mockObservation} /> );
    const observedDate = await screen.findByText(
      formatApiDatetime( mockObservation.time_observed_at, i18next )
    );
    expect( observedDate ).toBeVisible( );
    const createdDate = screen.queryByText(
      formatApiDatetime( mockObservation.created_at, i18next )
    );
    expect( createdDate ).toBeFalsy( );
  } );
} );
