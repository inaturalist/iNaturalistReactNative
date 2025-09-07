import Geolocation from "@react-native-community/geolocation";
import { screen } from "@testing-library/react-native";
import Match from "components/Match/Match";
import initI18next from "i18n/initI18next";
import React from "react";
import * as useLocationPermission from "sharedHooks/useLocationPermission";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

// Initialize i18next for translations
beforeAll( async () => {
  await initI18next();
} );

describe( "Match", ( ) => {
  // Mock props that would normally come from MatchContainer
  const defaultProps = {
    observation: factory( "LocalObservation" ),
    obsPhotos: [factory( "LocalObservationPhoto" )],
    onSuggestionChosen: jest.fn(),
    handleSaveOrDiscardPress: jest.fn(),
    navToTaxonDetails: jest.fn(),
    handleAddLocationPressed: jest.fn(),
    scrollRef: { current: null },
    topSuggestion: {
      combined_score: 92,
      taxon: factory( "LocalTaxon" )
    },
    otherSuggestions: [{
      combined_score: 90,
      taxon: factory( "LocalTaxon" )
    }]
  };

  beforeEach( () => {
    jest.clearAllMocks();
  } );

  it( "should show location permissions button if permissions not granted", () => {
    jest.spyOn( useLocationPermission, "default" ).mockImplementation( ( ) => ( {
      hasPermissions: false,
      renderPermissionsGate: jest.fn( )
    } ) );
    renderComponent(
      <Match
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...defaultProps}
        observation={defaultProps.observation}
      />
    );

    const addLocationButtons = screen.queryAllByText( /ADD LOCATION FOR BETTER IDS/i );
    expect( addLocationButtons.length ).toBeGreaterThan( 1 );
    expect( addLocationButtons[1] ).toBeVisible();
  } );

  it( "should not show location permissions button if permissions granted", () => {
    const mockWatchPosition = jest.fn( ( success, _error, _options ) => success( {
      coords: {
        latitude: 56,
        longitude: 9,
        accuracy: 8
      }
    } ) );
    Geolocation.watchPosition.mockImplementation( mockWatchPosition );
    jest.spyOn( useLocationPermission, "default" ).mockImplementation( ( ) => ( {
      hasPermissions: true,
      renderPermissionsGate: jest.fn( )
    } ) );

    renderComponent(
      <Match
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...defaultProps}
        observation={{
          ...defaultProps.observation,
          latitude: 24,
          longitude: -24
        }}
      />
    );

    const addLocationButton = screen.queryByText( /ADD LOCATION FOR BETTER IDS/i );
    expect( addLocationButton ).toBeFalsy( );
  } );
} );
