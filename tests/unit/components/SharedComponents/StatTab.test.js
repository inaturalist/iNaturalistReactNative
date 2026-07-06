import { render, screen } from "@testing-library/react-native";
import { ObservationsStatTab, SpeciesStatTab } from "components/SharedComponents/StatTab";
import initI18next from "i18n/initI18next";
import React from "react";

beforeAll( async () => {
  await initI18next();
} );

describe( "ObservationsStatTab", () => {
  it( "should render the formatted count with an observations label", async () => {
    render( <ObservationsStatTab count={42} /> );

    expect( await screen.findByText( "42" ) ).toBeTruthy();
    expect( await screen.findByText( "OBSERVATIONS" ) ).toBeTruthy();
  } );

  it( "should render a dash fallback when count is not a number", async () => {
    render( <ObservationsStatTab count={null} /> );

    expect( await screen.findByText( "--" ) ).toBeTruthy();
  } );

  it( "should render a dash fallback when count is undefined", async () => {
    render( <ObservationsStatTab /> );

    expect( await screen.findByText( "--" ) ).toBeTruthy();
  } );
} );

describe( "SpeciesStatTab", () => {
  it( "should render the formatted count with a species label", async () => {
    render( <SpeciesStatTab count={7} /> );

    expect( await screen.findByText( "7" ) ).toBeTruthy();
    expect( await screen.findByText( "SPECIES" ) ).toBeTruthy();
  } );

  it( "should render a dash fallback when count is not a number", async () => {
    render( <SpeciesStatTab count={null} /> );

    expect( await screen.findByText( "--" ) ).toBeTruthy();
  } );
} );
