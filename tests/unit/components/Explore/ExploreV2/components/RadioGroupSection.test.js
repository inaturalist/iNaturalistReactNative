import { screen, userEvent } from "@testing-library/react-native";
import RadioGroupSection
  from "components/Explore/ExploreV2/components/RadioGroupSection";
import React from "react";
import { renderComponent } from "tests/helpers/render";

const actor = userEvent.setup( );

const WILD_VALUES = {
  all: { label: "All", value: "all" },
  wild: { label: "Wild", value: "wild" },
  captive: { label: "Captive", value: "captive" },
};

const BOOLEAN_VALUES = {
  reviewed: { label: "Reviewed", value: true },
  unreviewed: { label: "Unreviewed", value: false },
};

describe( "RadioGroupSection", ( ) => {
  it( "renders the header and a row for every value", ( ) => {
    renderComponent(
      <RadioGroupSection
        headerText="WILD STATUS"
        onChange={jest.fn( )}
        selectedValue="all"
        values={WILD_VALUES}
      />,
    );

    expect( screen.getByText( "WILD STATUS" ) ).toBeTruthy( );
    expect( screen.getByText( "All" ) ).toBeTruthy( );
    expect( screen.getByText( "Wild" ) ).toBeTruthy( );
    expect( screen.getByText( "Captive" ) ).toBeTruthy( );
  } );

  it( "checks only the row matching the selected value", ( ) => {
    renderComponent(
      <RadioGroupSection
        headerText="WILD STATUS"
        onChange={jest.fn( )}
        selectedValue="wild"
        values={WILD_VALUES}
      />,
    );

    expect( screen.getByLabelText( "Wild" ) ).toBeChecked( );
    expect( screen.getByLabelText( "All" ) ).not.toBeChecked( );
    expect( screen.getByLabelText( "Captive" ) ).not.toBeChecked( );
  } );

  it( "calls onChange with the value of the row that was tapped", async ( ) => {
    const onChange = jest.fn( );
    renderComponent(
      <RadioGroupSection
        headerText="WILD STATUS"
        onChange={onChange}
        selectedValue="all"
        values={WILD_VALUES}
      />,
    );

    await actor.press( screen.getByText( "Captive" ) );

    expect( onChange ).toHaveBeenCalledWith( "captive" );
  } );

  it( "supports non-string values without stringifying them in onChange", async ( ) => {
    const onChange = jest.fn( );
    renderComponent(
      <RadioGroupSection
        headerText="REVIEWED"
        onChange={onChange}
        selectedValue
        values={BOOLEAN_VALUES}
      />,
    );

    expect( screen.getByLabelText( "Reviewed" ) ).toBeChecked( );

    await actor.press( screen.getByText( "Unreviewed" ) );

    expect( onChange ).toHaveBeenCalledWith( false );
  } );
} );
