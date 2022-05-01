import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import factory from "../../../factory";
import ObsEdit from "../../../../src/components/ObsEdit/ObsEdit";
import ObsEditProvider from "../../../../src/providers/ObsEditProvider";
import { ObsEditContext } from "../../../../src/providers/contexts";

// this resolves a test failure with the Animated library:
// Animated: `useNativeDriver` is not supported because the native animated module is missing.
jest.useFakeTimers( );

const mockLocationName = "San Francisco, CA";

jest.mock( "../../../../src/providers/ObsEditProvider" );

jest.mock( "../../../../src/sharedHooks/useLocationName" , ( ) => ( {
  __esModule: true,
  default: ( ) => {
    return mockLocationName;
  }
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav
  };
} );

jest.mock( "../../../../src/sharedHooks/useLoggedIn", ( ) => ( {
  __esModule: true,
  useLoggedIn: ( ) => true
} ) );

// Mock ObservationProvider so it provides a specific array of observations
// without any current observation or ability to update or fetch
// observations
const mockObsEditProviderWithObs = obs =>
  ObsEditProvider.mockImplementation( ( { children }: Props ): Node => (
    <ObsEditContext.Provider value={{
      observations: obs,
      currentObsNumber: 0
    }}>
      {children}
    </ObsEditContext.Provider>
  ) );

const renderObsEdit = ( ) => render(
  <NavigationContainer>
    <ObsEditProvider>
      <ObsEdit />
    </ObsEditProvider>
  </NavigationContainer>
);

test( "renders observation photo from photo gallery", ( ) => {
  const observations = [factory( "RemoteObservation", {
    latitude: 37.99,
    longitude: -142.88
  } )];
  mockObsEditProviderWithObs( observations );

  const { getByText } = renderObsEdit( );

  const obs = observations[0];
  const { longitude } = obs;

  expect( getByText( new RegExp( longitude ) ) ).toBeTruthy( );
} );

// right now this is failing on react-native-modal, since there's a TouchableWithFeedback
// that allows the user to tap the backdrop and exit the modal
test.todo( "should not have accessibility errors" );
