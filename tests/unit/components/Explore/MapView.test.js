import { screen, userEvent } from "@testing-library/react-native";
import * as useMapLocation from "components/Explore/hooks/useMapLocation.ts";
import MapView from "components/Explore/MapView.tsx";
import { ExploreProvider } from "providers/ExploreContext.tsx";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockData = { };
jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( {
    data: mockData
  } )
} ) );

const mockRedoSearch = jest.fn( );
jest.mock( "components/Explore/hooks/useMapLocation", () => ( {
  __esModule: true,
  default: ( ) => ( {
    showMapBoundaryButton: false,
    redoSearchInMapArea: mockRedoSearch
  } )
} ) );

const mockObservations = [
  factory( "RemoteObservation" ),
  factory( "RemoteObservation" )
];

const exploreMap = (
  <ExploreProvider>
    <MapView observations={mockObservations} />
  </ExploreProvider>
);

describe( "MapView", () => {
  beforeAll( async ( ) => {
    // userEvent recommends fake timers
    jest.useFakeTimers( );
  } );

  it( "should be accessible", ( ) => {
    expect( exploreMap ).toBeAccessible( );
  } );

  it( "should hide redo search button by default", async ( ) => {
    renderComponent( <MapView /> );

    const redoSearchButton = screen.queryByText( /REDO SEARCH IN MAP AREA/ );
    expect( redoSearchButton ).toBeFalsy( );
  } );

  it( "should render redo search button", async ( ) => {
    jest.spyOn( useMapLocation, "default" )
      .mockImplementation( ( ) => ( { showMapBoundaryButton: true } ) );
    renderComponent( <MapView /> );

    const redoSearchButton = screen.queryByText( /REDO SEARCH IN MAP AREA/ );
    expect( redoSearchButton ).toBeVisible( );
  } );

  it( "should update map boundaries when redo search is pressed", async ( ) => {
    jest.spyOn( useMapLocation, "default" )
      .mockImplementation( ( ) => ( {
        showMapBoundaryButton: true,
        redoSearchInMapArea: mockRedoSearch
      } ) );
    renderComponent( <MapView /> );

    const actor = await userEvent.setup( );
    const redoSearchButton = screen.queryByText( /REDO SEARCH IN MAP AREA/ );
    await actor.press( redoSearchButton );

    expect( mockRedoSearch ).toHaveBeenCalled( );
  } );
} );
