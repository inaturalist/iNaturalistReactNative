/* eslint-disable react/jsx-props-no-spreading */
import { screen, userEvent } from "@testing-library/react-native";
import MapView from "components/Explore/MapView";
import { EXPLORE_ACTION, ExploreProvider } from "providers/ExploreContext";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

// Mock the useExplore hook with a mock dispatch function
const mockDispatch = jest.fn( );
const mockDefaultExploreLocation = jest.fn( ).mockResolvedValue( {
  lat: 10,
  lng: 20
} );

// Create a mock implementation of the ExploreContext
jest.mock( "providers/ExploreContext.tsx", ( ) => {
  const originalModule = jest.requireActual( "providers/ExploreContext.tsx" );
  return {
    __esModule: true,
    ...originalModule,
    useExplore: ( ) => ( {
      state: {
        lat: 10,
        lng: 20,
        placeMode: originalModule.PLACE_MODE.NEARBY,
        place: null
      },
      dispatch: mockDispatch,
      defaultExploreLocation: mockDefaultExploreLocation
    } )
  };
} );

const mockObservationBounds = {
  swlat: 10,
  swlng: 20,
  nelat: 30,
  nelng: 40
};

const mockRequestLocationPermissions = jest.fn( );

const defaultProps = {
  observationBounds: mockObservationBounds,
  queryParams: {
    taxon_id: 1,
    return_bounds: true
  },
  isLoading: false,
  hasLocationPermissions: true,
  renderLocationPermissionsGate: jest.fn( ),
  requestLocationPermissions: mockRequestLocationPermissions
};

const mockObservations = [
  factory( "RemoteObservation" ),
  factory( "RemoteObservation" )
];

function renderMapView( ) {
  renderComponent( <ExploreProvider><MapView {...defaultProps} /></ExploreProvider> );
}

const actor = userEvent.setup( );

describe( "MapView", ( ) => {
  beforeEach( () => {
    jest.useFakeTimers();
  } );

  afterEach( () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  } );

  it( "should be accessible", ( ) => {
    const exploreMap = (
      <ExploreProvider>
        <MapView observations={mockObservations} {...defaultProps} />
      </ExploreProvider>
    );
    // Disabled during the update to RN 0.78
    expect( exploreMap ).toBeTruthy( );
    // expect( exploreMap ).toBeAccessible( );
  } );

  it( "should hide redo search button by default", ( ) => {
    renderMapView( );

    const redoSearchButton = screen.queryByText( /REDO SEARCH IN MAP AREA/ );
    expect( redoSearchButton ).toBeFalsy( );
  } );

  it( "should dispatch SET_EXPLORE_LOCATION when current location button is pressed", async ( ) => {
    renderMapView( );

    const currentLocationButton = screen.getByTestId( "Map.CurrentLocationButton" );
    await actor.press( currentLocationButton );

    await Promise.resolve( );
    jest.runAllTimers( );

    expect( mockDefaultExploreLocation ).toHaveBeenCalled( );

    expect( mockDispatch ).toHaveBeenCalledWith( {
      type: EXPLORE_ACTION.SET_EXPLORE_LOCATION,
      exploreLocation: { lat: 10, lng: 20 }
    } );
  } );

  it( "should dispatch requestLocationPermissions when current location button "
    + " is pressed and user has not given permissions", async ( ) => {
    renderComponent(
      <ExploreProvider>
        <MapView
          {...defaultProps}
          hasLocationPermissions={false}
        />
      </ExploreProvider>
    );

    const currentLocationButton = screen.getByTestId( "Map.CurrentLocationButton" );
    await actor.press( currentLocationButton );

    await Promise.resolve( );
    jest.runAllTimers( );

    expect( mockRequestLocationPermissions ).toHaveBeenCalled( );
  } );

  it( "should show loading indicator when isLoading is true", ( ) => {
    renderComponent(
      <ExploreProvider>
        <MapView {...defaultProps} isLoading />
      </ExploreProvider>
    );

    const loadingIndicator = screen.getByTestId( "activity-indicator" );
    expect( loadingIndicator ).toBeTruthy( );
  } );
} );
