import { screen, userEvent } from "@testing-library/react-native";
import RecentLocations from "components/Explore/ExploreV2/components/RecentLocations";
import inatPlaceTypes from "dictionaries/places";
import initI18next from "i18n/initI18next";
import React from "react";
import useStore from "stores/useStore";
import { renderComponent } from "tests/helpers/render";

const MONTEREY = { id: 1, display_name: "Monterey, CA, US", place_type: 9 };
const MONTENEGRO = { id: 2, display_name: "Montenegro", place_type: 12 };

const recents = ( ) => useStore.getState( ).exploreRecentSearches;

const actor = userEvent.setup( );

beforeAll( async ( ) => {
  await initI18next( );
} );

beforeEach( ( ) => {
  recents( ).clearRecents( );
} );

describe( "RecentLocations", ( ) => {
  it( "renders nothing when there are no recent places", ( ) => {
    renderComponent( <RecentLocations onSelectPlace={jest.fn( )} /> );

    expect( screen.queryByTestId( "RecentLocations" ) ).toBeNull( );
  } );

  it( "renders a row per recent place, newest first", ( ) => {
    recents( ).recordPlace( MONTENEGRO );
    recents( ).recordPlace( MONTEREY );
    renderComponent( <RecentLocations onSelectPlace={jest.fn( )} /> );

    expect( screen.getByTestId( "RecentLocations" ) ).toBeVisible( );
    expect(
      screen.getAllByTestId( /^LocationSearchResult\./ ).map( row => row.props.testID ),
    ).toEqual( ["LocationSearchResult.1", "LocationSearchResult.2"] );
    expect( screen.getByText( MONTEREY.display_name ) ).toBeVisible( );
    expect( screen.getByText( MONTENEGRO.display_name ) ).toBeVisible( );
    // The stored place carries its type, so the row can label it
    expect( screen.getByText( inatPlaceTypes[MONTEREY.place_type] ) ).toBeVisible( );
  } );

  it( "passes the tapped place to onSelectPlace", async ( ) => {
    const onSelectPlace = jest.fn( );
    recents( ).recordPlace( MONTEREY );
    renderComponent( <RecentLocations onSelectPlace={onSelectPlace} /> );

    await actor.press( screen.getByTestId( "LocationSearchResult.1" ) );

    expect( onSelectPlace ).toHaveBeenCalledWith( MONTEREY );
  } );
} );
