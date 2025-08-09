import { screen } from "@testing-library/react-native";
import DatePicker from "components/ObsEdit/DatePicker.tsx";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockLocalObservation = factory( "LocalObservation", {
  observed_on_string: "2024-08-09T12:21"
} );

const mockRemoteObservation = factory( "RemoteObservation", {
  // jest timezone is set to UTC time
  time_observed_at: "2024-06-15T17:26:00-00:00",
  observed_on_string: null,
  observed_time_zone: "UTC"
} );

const mockLocalObservationNoDate = factory( "LocalObservation", {
  observed_on_string: null
} );

describe( "DatePicker", ( ) => {
  it( "has no accessibility errors", ( ) => {
    // const datePicker = <DatePicker />;
    // Disabled during the update to RN 0.78
    // expect( datePicker ).toBeAccessible( );
  } );

  it( "displays date with no seconds from local observation", ( ) => {
    renderComponent( <DatePicker currentObservation={mockLocalObservation} /> );

    const date = screen.getByText( "08/09/2024, 12:21 PM" );
    expect( date ).toBeVisible( );
  } );

  it( "displays date with no seconds from remote observation", ( ) => {
    renderComponent( <DatePicker currentObservation={mockRemoteObservation} /> );

    const date = screen.getByText( "06/15/2024, 5:26 PM (UTC)" );
    expect( date ).toBeVisible( );
  } );

  it( "displays Add Date text when observation has no date", ( ) => {
    renderComponent( <DatePicker currentObservation={mockLocalObservationNoDate} /> );

    const addDateText = screen.getByText( "Add Date/Time" );
    expect( addDateText ).toBeVisible( );
  } );
} );
