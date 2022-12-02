import { NavigationContainer } from "@react-navigation/native";
import { render, waitFor } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import { ObsEditContext } from "providers/contexts";
import ObsEditProvider from "providers/ObsEditProvider";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import factory from "../../../factory";

// this resolves a test failure with the Animated library:
// Animated: `useNativeDriver` is not supported because the native animated module is missing.
jest.useFakeTimers( );

jest.mock( "providers/ObsEditProvider" );

// mock Portal with a Modal component inside of it (MediaViewer)
jest.mock( "react-native-paper", () => {
  const RealModule = jest.requireActual( "react-native-paper" );
  const MockedModule = {
    ...RealModule,
    // eslint-disable-next-line react/jsx-no-useless-fragment
    Portal: ( { children } ) => <>{children}</>
  };
  return MockedModule;
} );

const mockLocationName = "San Francisco, CA";

jest.mock( "sharedHooks/useLocationName", ( ) => ( {
  __esModule: true,
  default: ( ) => mockLocationName
} ) );

jest.mock( "sharedHooks/useLoggedIn", ( ) => ( {
  __esModule: true,
  default: ( ) => true
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
    } ),
    useNavigation: ( ) => ( {
      setOptions: jest.fn( )
    } )
  };
} );

const mockCurrentUser = factory( "LocalUser" );
const mockFetchUserLocation = jest.fn( () => ( { latitude: 37, longitude: 34 } ) );
jest.mock( "sharedHelpers/fetchUserLocation", ( ) => ( {
  __esModule: true,
  default: () => mockFetchUserLocation()
} ) );

// https://github.com/APSL/react-native-keyboard-aware-scroll-view/issues/493#issuecomment-861711442
jest.mock( "react-native-keyboard-aware-scroll-view", ( ) => ( {
  KeyboardAwareScrollView: jest
    .fn( )
    .mockImplementation( ( { children } ) => children )
} ) );

// Mock ObservationProvider so it provides a specific array of observations
// without any current observation or ability to update or fetch
// observations
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

const renderObsEdit = ( ) => render(
  <SafeAreaProvider>
    <NavigationContainer>
      <ObsEditProvider>
        <ObsEdit />
      </ObsEditProvider>
    </NavigationContainer>
  </SafeAreaProvider>
);

test( "renders observation photo from photo gallery", ( ) => {
  const observations = [factory( "RemoteObservation", {
    latitude: 37.99,
    longitude: -142.88,
    user: mockCurrentUser,
    place_guess: mockLocationName
  } )];
  mockObsEditProviderWithObs( observations );

  const { getByText } = renderObsEdit( );

  const obs = observations[0];

  expect( getByText( obs.place_guess ) ).toBeTruthy( );
  expect( getByText( new RegExp( obs.longitude ) ) ).toBeTruthy( );
} );

describe( "Fetch User Location", () => {
  beforeEach( () => {
    // resets mock back to original state
    mockFetchUserLocation.mockReset();
  } );

  test( "fetch location when new observation user hasn't saved", async ( ) => {
    const observations = [{}];
    mockObsEditProviderWithObs( observations );
    expect( mockFetchUserLocation ).not.toHaveBeenCalled();

    const { findByText } = renderObsEdit( );

    await waitFor( () => {
      expect( mockFetchUserLocation ).toHaveBeenCalled();
    } );
    expect( findByText( /Lat:/ ) ).toBeTruthy();
  } );

  // test fails,  potentially indicating a bug
  // eslint-disable-next-line max-len
  // test( "don't fetch location for existing obs created on device that hasn't been uploaded", async ( ) => {
  //   const observations = [factory( "LocalObservation" )];
  //   mockObsEditProviderWithObs( observations );
  //   const { queryByText } = renderObsEdit( );
  //   const obs = observations[0];
  //   const lat = obs.latitude;

  //   expect( queryByText( `Lat: ${lat}` ) );
  //   expect( mockFetchUserLocation ).not.toHaveBeenCalled();
  //   expect( queryByText( `Lat: ${lat}` ) );
  // } );

  test( "don't fetch location for existing observation created elsewhere:", async ( ) => {
    const observations = [factory( "RemoteObservation" )];
    mockObsEditProviderWithObs( observations );
    const { queryByText } = renderObsEdit( );
    const obs = observations[0];
    const lat = obs.latitude;

    expect( queryByText( `Lat: ${lat}` ) );
    expect( mockFetchUserLocation ).not.toHaveBeenCalled();
    expect( queryByText( `Lat: ${lat}` ) );
  } );
} );
// right now this is failing on react-native-modal, since there's a TouchableWithFeedback
// that allows the user to tap the backdrop and exit the modal
test.todo( "should not have accessibility errors" );
