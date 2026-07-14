import { screen, userEvent } from "@testing-library/react-native";
import LocationDefaultOptions
  from "components/Explore/ExploreV2/components/LocationDefaultOptions";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import React from "react";
import { renderComponent } from "tests/helpers/render";

const RECENT_SEARCHES = [
  { id: 1, display_name: "Monterey, CA, US" },
  { id: 2, display_name: "Oakland, CA, US" },
];

const renderOptions = props => renderComponent(
  <LocationDefaultOptions
    onSelectNearby={jest.fn( )}
    onSelectWorldwide={jest.fn( )}
    recentSearches={[]}
    onSelectRecent={jest.fn( )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />,
);

beforeAll( async ( ) => {
  await initI18next( );
} );

describe( "LocationDefaultOptions", ( ) => {
  it( "renders the Nearby and Worldwide default rows", ( ) => {
    renderOptions( );

    expect( screen.getByTestId( "LocationDefaultOptions" ) ).toBeTruthy( );
    expect( screen.getByRole( "button", { name: i18next.t( "Nearby" ) } ) ).toBeTruthy( );
    expect( screen.getByRole( "button", { name: i18next.t( "Worldwide" ) } ) ).toBeTruthy( );
    expect( screen.getByText( i18next.t( "Nearby" ) ) ).toBeTruthy( );
    expect( screen.getByText( i18next.t( "Worldwide" ) ) ).toBeTruthy( );
  } );

  it( "calls onSelectNearby when the Nearby row is tapped", async ( ) => {
    const actor = userEvent.setup( );
    const onSelectNearby = jest.fn( );
    renderOptions( { onSelectNearby } );

    await actor.press( screen.getByRole( "button", { name: i18next.t( "Nearby" ) } ) );

    expect( onSelectNearby ).toHaveBeenCalledTimes( 1 );
  } );

  it( "calls onSelectWorldwide when the Worldwide row is tapped", async ( ) => {
    const actor = userEvent.setup( );
    const onSelectWorldwide = jest.fn( );
    renderOptions( { onSelectWorldwide } );

    await actor.press( screen.getByRole( "button", { name: i18next.t( "Worldwide" ) } ) );

    expect( onSelectWorldwide ).toHaveBeenCalledTimes( 1 );
  } );

  it( "renders recent searches with the Recent Search subtitle", ( ) => {
    renderOptions( { recentSearches: RECENT_SEARCHES } );

    expect( screen.getByTestId( "LocationSearchResult.1" ) ).toBeTruthy( );
    expect( screen.getByText( "Monterey, CA, US" ) ).toBeTruthy( );
    expect( screen.getByText( "Oakland, CA, US" ) ).toBeTruthy( );
    // one "Recent Search" subtitle per recent row
    expect( screen.getAllByText( i18next.t( "Recent-Search" ) ) ).toHaveLength( 2 );
  } );

  it( "renders no recent rows when there are none", ( ) => {
    renderOptions( { recentSearches: [] } );

    expect( screen.queryByText( i18next.t( "Recent-Search" ) ) ).toBeNull( );
  } );

  it( "calls onSelectRecent with the place when a recent row is tapped", async ( ) => {
    const actor = userEvent.setup( );
    const onSelectRecent = jest.fn( );
    renderOptions( { recentSearches: RECENT_SEARCHES, onSelectRecent } );

    await actor.press( screen.getByTestId( "LocationSearchResult.2" ) );

    expect( onSelectRecent ).toHaveBeenCalledWith( RECENT_SEARCHES[1] );
  } );
} );
