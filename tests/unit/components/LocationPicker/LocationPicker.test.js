import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import LocationPicker from "components/LocationPicker/LocationPicker";
import initI18next from "i18n/initI18next";
import { ObsEditContext } from "providers/contexts";
import ObsEditProvider from "providers/ObsEditProvider";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      setOptions: jest.fn( )
    } )
  };
} );

// Mock ObservationProvider so it provides a specific array of observations
// without any current observation or ability to update or fetch
// observations
jest.mock( "providers/ObsEditProvider" );
const mockObsEditProviderWithObs = obs => ObsEditProvider.mockImplementation( ( { children } ) => (
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  <ObsEditContext.Provider value={{
    observations: obs,
    currentObservation: obs[0]
  }}
  >
    {children}
  </ObsEditContext.Provider>
) );

const renderLocationPicker = ( ) => renderComponent(
  <ObsEditProvider>
    <LocationPicker route={{
      params: {
        goBackOnSave: jest.fn( )
      }
    }}
    />
  </ObsEditProvider>
);

const mockPlaceResult = factory( "RemotePlace", {
  display_name: "New York"
} );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: [mockPlaceResult]
  } )
} ) );

describe( "LocationPicker", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it(
    "should display latitude corresponding with location name",
    async ( ) => {
      const observations = [
        factory( "RemoteObservation", {
        // Oakland, CA latlng
          latitude: 37.804855,
          longitude: -122.272504
        } )
      ];
      mockObsEditProviderWithObs( observations );
      renderLocationPicker( );
      const initialLatitude = screen.getByText( new RegExp( observations[0].latitude ) );
      expect( initialLatitude ).toBeTruthy( );
    }
  );

  it(
    "should show search results when a user changes search text",
    async ( ) => {
      const observations = [
        factory( "RemoteObservation", {
          // Oakland, CA latlng
          latitude: 37.804855,
          longitude: -122.272504
        } )
      ];
      mockObsEditProviderWithObs( observations );
      renderLocationPicker( );
      const input = screen.getByTestId( "LocationPicker.locationSearch" );
      const initialLatitude = screen.getByText( new RegExp( observations[0].latitude ) );
      expect( initialLatitude ).toBeTruthy( );
      fireEvent.changeText( input, "New" );
      await waitFor( ( ) => {
        expect( screen.getByText( mockPlaceResult.display_name ) ).toBeTruthy( );
      } );
    }
  );

  it(
    "should move map to new coordinates when a user presses place result",
    async ( ) => {
      const observations = [
        factory( "RemoteObservation", {
          // Oakland, CA latlng
          latitude: 37.804855,
          longitude: -122.272504
        } )
      ];
      mockObsEditProviderWithObs( observations );
      renderLocationPicker( );
      const input = screen.getByTestId( "LocationPicker.locationSearch" );
      const initialLatitude = screen.getByText( new RegExp( observations[0].latitude ) );
      expect( initialLatitude ).toBeTruthy( );
      fireEvent.changeText( input, "New" );
      await waitFor( ( ) => {
        expect( screen.getByText( mockPlaceResult.display_name ) ).toBeTruthy( );
      } );
      fireEvent.press( screen.getByText( mockPlaceResult.display_name ) );
      await waitFor( ( ) => {
        expect( screen.getByText(
          new RegExp( mockPlaceResult.point_geojson.coordinates[0] )
        ) ).toBeTruthy( );
      } );
    }
  );
} );
