import { screen, userEvent } from "@testing-library/react-native";
import LocationDefaultOptions
  from "components/Explore/ExploreV2/components/LocationDefaultOptions";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import React from "react";
import { renderComponent } from "tests/helpers/render";

beforeAll( async ( ) => {
  await initI18next( );
} );

describe( "LocationDefaultOptions", ( ) => {
  it( "renders the Nearby and Worldwide default rows", ( ) => {
    renderComponent(
      <LocationDefaultOptions onSelectNearby={jest.fn( )} onSelectWorldwide={jest.fn( )} />,
    );

    expect( screen.getByTestId( "LocationDefaultOptions" ) ).toBeTruthy( );
    expect( screen.getByRole( "button", { name: i18next.t( "Nearby" ) } ) ).toBeTruthy( );
    expect( screen.getByRole( "button", { name: i18next.t( "Worldwide" ) } ) ).toBeTruthy( );
    expect( screen.getByText( i18next.t( "Nearby" ) ) ).toBeTruthy( );
    expect( screen.getByText( i18next.t( "Worldwide" ) ) ).toBeTruthy( );
  } );

  it( "calls onSelectNearby when the Nearby row is tapped", async ( ) => {
    const actor = userEvent.setup( );
    const onSelectNearby = jest.fn( );
    renderComponent(
      <LocationDefaultOptions onSelectNearby={onSelectNearby} onSelectWorldwide={jest.fn( )} />,
    );

    await actor.press( screen.getByRole( "button", { name: i18next.t( "Nearby" ) } ) );

    expect( onSelectNearby ).toHaveBeenCalledTimes( 1 );
  } );

  it( "calls onSelectWorldwide when the Worldwide row is tapped", async ( ) => {
    const actor = userEvent.setup( );
    const onSelectWorldwide = jest.fn( );
    renderComponent(
      <LocationDefaultOptions onSelectNearby={jest.fn( )} onSelectWorldwide={onSelectWorldwide} />,
    );

    await actor.press( screen.getByRole( "button", { name: i18next.t( "Worldwide" ) } ) );

    expect( onSelectWorldwide ).toHaveBeenCalledTimes( 1 );
  } );
} );
