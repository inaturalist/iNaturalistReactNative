import { screen, userEvent } from "@testing-library/react-native";
import MapView from "components/Explore/MapView";
import MapViewContainer from "components/Explore/MapViewContainer";
import initI18next from "i18n/initI18next";
import { ExploreProvider } from "providers/ExploreContext.tsx";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockObservations = [
  factory( "RemoteObservation" ),
  factory( "RemoteObservation" )
];

const exploreMapContainer = (
  <ExploreProvider>
    <MapViewContainer observations={mockObservations} />
  </ExploreProvider>
);

describe( "MapView", () => {
  beforeAll( async ( ) => {
    await initI18next( );
    // userEvent recommends fake timers
    jest.useFakeTimers( );
  } );

  it( "should be accessible", ( ) => {
    expect( exploreMapContainer ).toBeAccessible( );
  } );

  it( "should render redo search button", async ( ) => {
    renderComponent(
      <MapView
        showMapBoundaryButton
      />
    );

    const redoSearchButton = screen.queryByText( /REDO SEARCH IN MAP AREA/ );
    expect( redoSearchButton ).toBeVisible( );
  } );

  const mockRedoSearch = jest.fn( );

  it( "should update map boundaries when redo search is pressed", async ( ) => {
    renderComponent(
      <MapView
        showMapBoundaryButton
        redoSearchInMapArea={mockRedoSearch}
      />
    );

    const actor = await userEvent.setup( );
    const redoSearchButton = screen.queryByText( /REDO SEARCH IN MAP AREA/ );
    await actor.press( redoSearchButton );

    expect( mockRedoSearch ).toHaveBeenCalled( );
  } );

  it( "should hide redo search button", async ( ) => {
    renderComponent(
      <MapView
        showMapBoundaryButton={false}
      />
    );

    const redoSearchButton = screen.queryByText( /REDO SEARCH IN MAP AREA/ );
    expect( redoSearchButton ).toBeFalsy( );
  } );
} );
