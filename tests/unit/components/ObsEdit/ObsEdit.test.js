import { NavigationContainer } from "@react-navigation/native";
import { render } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import { UploadContext } from "providers/contexts";
import UploadProvider from "providers/UploadProvider";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import factory from "../../../factory";

// this resolves a test failure with the Animated library:
// Animated: `useNativeDriver` is not supported because the native animated module is missing.
jest.useFakeTimers( );

const mockLocationName = "San Francisco, CA";

jest.mock( "../../../../src/providers/UploadProvider" );

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

jest.mock( "../../../../src/sharedHooks/useLocationName", ( ) => ( {
  __esModule: true,
  default: ( ) => mockLocationName
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
    } )
  };
} );

jest.mock( "../../../../src/sharedHooks/useLoggedIn", ( ) => ( {
  __esModule: true,
  default: ( ) => true
} ) );

const mockCurrentUser = factory( "LocalUser" );

jest.mock( "../../../../src/components/LoginSignUp/AuthenticationService", ( ) => ( {
  getUserId: ( ) => mockCurrentUser.id
} ) );

// Mock ObservationProvider so it provides a specific array of observations
// without any current observation or ability to update or fetch
// observations
const mockUploadProviderWithObs = obs => UploadProvider.mockImplementation( ( { children } ) => (
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  <UploadContext.Provider value={{
    observations: obs,
    currentObsIndex: 0
  }}
  >
    {children}
  </UploadContext.Provider>
) );

const renderObsEdit = ( ) => render(
  <SafeAreaProvider>
    <NavigationContainer>
      <UploadProvider>
        <ObsEdit />
      </UploadProvider>
    </NavigationContainer>
  </SafeAreaProvider>
);

test( "renders observation photo from photo gallery", ( ) => {
  const observations = [factory( "RemoteObservation", {
    latitude: 37.99,
    longitude: -142.88,
    user: mockCurrentUser
  } )];
  mockUploadProviderWithObs( observations );

  const { getByText } = renderObsEdit( );

  const obs = observations[0];
  const { longitude } = obs;

  expect( getByText( new RegExp( longitude ) ) ).toBeTruthy( );
} );

// right now this is failing on react-native-modal, since there's a TouchableWithFeedback
// that allows the user to tap the backdrop and exit the modal
test.todo( "should not have accessibility errors" );
