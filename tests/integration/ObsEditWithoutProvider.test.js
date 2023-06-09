import { faker } from "@faker-js/faker";
import { screen, waitFor } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import initI18next from "i18n/initI18next";
import { ObsEditContext } from "providers/contexts";
import INatPaperProvider from "providers/INatPaperProvider";
import ObsEditProvider from "providers/ObsEditProvider";
import React from "react";

import factory from "../factory";
import { renderComponent } from "../helpers/render";

jest.mock( "providers/ObsEditProvider" );

const mockLocationName = "San Francisco, CA";

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: () => ( {} ),
    useNavigation: () => ( {
      setOptions: jest.fn()
    } )
  };
} );

const mockCurrentUser = factory( "LocalUser" );

const mockFetchUserLocation = jest.fn( () => ( { latitude: 37, longitude: 34 } ) );
jest.mock( "sharedHelpers/fetchUserLocation", () => ( {
  __esModule: true,
  default: () => mockFetchUserLocation()
} ) );

// Mock ObservationProvider so it provides a specific array of observations
// without any current observation or ability to update or fetch
// observations
const mockObsEditProviderWithObs = obs => ObsEditProvider.mockImplementation( ( { children } ) => (
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  <INatPaperProvider>
    <ObsEditContext.Provider value={{
      observations: obs,
      currentObservation: obs[0],
      updateObservationKeys: jest.fn( ),
      setPassesIdentificationTest: jest.fn( ),
      writeExifToCameraRollPhotos: jest.fn( )
    }}
    >
      {children}
    </ObsEditContext.Provider>
  </INatPaperProvider>
) );

const renderObsEdit = () => renderComponent(
  <ObsEditProvider>
    <ObsEdit />
  </ObsEditProvider>
);

describe( "basic rendering", ( ) => {
  beforeAll( async () => {
    await initI18next();
  } );

  it( "should render place_guess and latitude", ( ) => {
    const observations = [factory( "RemoteObservation", {
      latitude: 37.99,
      longitude: -142.88,
      user: mockCurrentUser,
      place_guess: mockLocationName
    } )];
    mockObsEditProviderWithObs( observations );

    renderObsEdit( );

    const obs = observations[0];

    expect( screen.getByText( obs.place_guess ) ).toBeTruthy( );
    expect( screen.getByText( new RegExp( `${obs.latitude}` ) ) ).toBeTruthy( );
  } );
} );

describe( "location fetching", () => {
  beforeAll( async () => {
    await initI18next();
  } );

  beforeEach( () => {
    // resets mock back to original state
    mockFetchUserLocation.mockReset();
  } );

  test( "should fetch location when new observation hasn't saved", async ( ) => {
    const observations = [{}];
    mockObsEditProviderWithObs( observations );
    expect( mockFetchUserLocation ).not.toHaveBeenCalled();

    renderObsEdit();

    await waitFor( () => {
      expect( mockFetchUserLocation ).toHaveBeenCalled();
    } );
    // Note: it would be nice to look for an update in the UI, but since we've
    // mocked ObsEditProvider here, it will never update. Might be good for
    // an integration test
  } );

  test( "shouldn't fetch location for existing obs on device that hasn't uploaded", async () => {
    const observation = factory( "LocalObservation" );
    expect( observation.id ).toBeFalsy();
    expect( observation.created_at ).toBeFalsy();
    expect( observation._created_at ).toBeTruthy();
    mockObsEditProviderWithObs( [observation] );
    renderObsEdit();

    expect(
      screen.getByText( new RegExp( `Lat: ${observation.latitude}` ) )
    ).toBeTruthy();
    expect( mockFetchUserLocation ).not.toHaveBeenCalled();
  } );

  test( "shouldn't fetch location for existing observation created elsewhere", async () => {
    const observation = factory( "LocalObservation", {
      id: faker.datatype.number(),
      created_at: faker.date.past(),
      _synced_at: faker.date.past()
    } );
    expect( observation.id ).toBeTruthy();
    expect( observation.created_at ).toBeTruthy();
    mockObsEditProviderWithObs( [observation] );
    renderObsEdit();

    expect(
      screen.getByText( new RegExp( `Lat: ${observation.latitude}` ) )
    ).toBeTruthy();
    expect( mockFetchUserLocation ).not.toHaveBeenCalled();
  } );
} );
