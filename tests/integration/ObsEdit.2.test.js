import { waitFor } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import faker from "faker";
import { ObsEditContext } from "providers/contexts";
import ObsEditProvider from "providers/ObsEditProvider";
import React from "react";

import factory from "../factory";
import { renderComponent } from "../helpers/render";

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

jest.mock( "components/ObsEdit/ObsEditHeaderTitle" );
jest.mock( "components/ObsEdit/DeleteObservationDialog" );
jest.mock( "components/ObsEdit/SaveDialog" );
jest.mock( "components/MediaViewer/MediaViewerModal" );
// jest.mock( "components/ObsEdit/EvidenceSection" );
jest.mock( "components/ObsEdit/IdentificationSection" );
jest.mock( "components/ObsEdit/OtherDataSection" );
jest.mock( "components/ObsEdit/AddEvidenceModal" );

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

const renderObsEdit = ( ) => renderComponent(
  <ObsEditProvider>
    <ObsEdit />
  </ObsEditProvider>
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

describe( "location fetching", () => {
  beforeEach( () => {
    // resets mock back to original state
    mockFetchUserLocation.mockReset();
  } );
  test( "should fetch location when new observation hasn't saved", async ( ) => {
    const observations = [{}];
    mockObsEditProviderWithObs( observations );
    expect( mockFetchUserLocation ).not.toHaveBeenCalled();

    renderObsEdit( );

    await waitFor( () => {
      expect( mockFetchUserLocation ).toHaveBeenCalled();
    } );
    // Note: it would be nice to look for an update in the UI, but since we've
    // mocked ObsEditProvider here, it will never update. Might be good for
    // an integration test
  } );

  test( "shouldn't fetch location for existing obs on device that hasn't uploaded", async ( ) => {
    const observation = factory( "LocalObservation" );
    expect( observation.id ).toBeFalsy( );
    expect( observation.created_at ).toBeFalsy( );
    expect( observation._created_at ).toBeTruthy( );
    mockObsEditProviderWithObs( [observation] );
    const { queryByText } = renderObsEdit( );

    expect( queryByText( new RegExp( `Lat: ${observation.latitude}` ) ) ).toBeTruthy( );
    expect( mockFetchUserLocation ).not.toHaveBeenCalled();
  } );

  test( "shouldn't fetch location for existing observation created elsewhere", async ( ) => {
    const observation = factory( "LocalObservation", {
      id: faker.datatype.number( ),
      created_at: faker.date.past( ),
      _synced_at: faker.date.past( )
    } );
    expect( observation.id ).toBeTruthy( );
    expect( observation.created_at ).toBeTruthy( );
    mockObsEditProviderWithObs( [observation] );
    const { queryByText } = renderObsEdit( );

    expect( queryByText( new RegExp( `Lat: ${observation.latitude}` ) ) ).toBeTruthy( );
    expect( mockFetchUserLocation ).not.toHaveBeenCalled();
  } );
} );
