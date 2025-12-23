import { screen } from "@testing-library/react-native";
import NotesSection from "components/ObsDetailsDefaultMode/NotesSection/NotesSection";
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
  description: faker.lorem.paragraph( ),
} );

describe( "NotesSection", ( ) => {
  test( "should show description of observation", async ( ) => {
    renderComponent( <NotesSection description={mockObservation.description} /> );

    const description = await screen.findByText( mockObservation.description );
    expect( description ).toBeTruthy( );
  } );
} );
