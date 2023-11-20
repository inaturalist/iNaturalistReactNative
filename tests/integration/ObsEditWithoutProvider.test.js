import { faker } from "@faker-js/faker";
import { screen, waitFor } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import initI18next from "i18n/initI18next";
import { ObsEditContext } from "providers/contexts";
import INatPaperProvider from "providers/INatPaperProvider";
import ObsEditProvider from "providers/ObsEditProvider";
import React from "react";
import { LOCATION_FETCH_INTERVAL } from "sharedHooks/useCurrentObservationLocation";

import factory from "../factory";
import { renderComponent } from "../helpers/render";

jest.mock( "providers/ObsEditProvider" );

const mockLocationName = "San Francisco, CA";

// import { checkMultiple, RESULTS } from "react-native-permissions";
// jest.mock( "react-native-permissions", ( ) => {
//   const actual = jest.requireActual( "react-native-permissions" );
//   return {
//     ...actual,
//     checkMultiple: permissions => permissions.reduce(
//       ( memo, permission ) => {
//         memo[permission] = actual.RESULTS.GRANTED;
//         return memo;
//       },
//       {}
//     )
//   };
// } );
// jest.mock('react-native-permissions', () => require('react-native-permissions/mock'));

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
      writeExifToCameraRollPhotos: jest.fn( ),
      photoEvidenceUris: [faker.image.imageUrl( )],
      setPhotoEvidenceUris: jest.fn( )
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

const mockTaxon = factory( "RemoteTaxon", {
  name: faker.name.firstName( ),
  rank: "genus",
  rank_level: 27,
  preferred_common_name: faker.name.fullName( ),
  default_photo: {
    square_url: faker.image.imageUrl( )
  },
  ancestors: [{
    id: faker.datatype.number( ),
    preferred_common_name: faker.name.fullName( ),
    name: faker.name.fullName( ),
    rank: "class"
  }],
  wikipedia_summary: faker.lorem.paragraph( ),
  taxonPhotos: [{
    photo: factory( "RemotePhoto" )
  }],
  wikipedia_url: faker.internet.url( )
} );

describe( "basic rendering", ( ) => {
  beforeAll( async () => {
    await initI18next();
  } );

  it( "should render place_guess and latitude", ( ) => {
    const observations = [factory( "RemoteObservation", {
      latitude: 37.99,
      longitude: -142.88,
      user: mockCurrentUser,
      place_guess: mockLocationName,
      taxon: mockTaxon,
      observationPhotos: []
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
    const observations = [factory( "LocalObservation", {
      observationPhotos: []
    } )];
    mockObsEditProviderWithObs( observations );
    expect( mockFetchUserLocation ).not.toHaveBeenCalled();

    renderObsEdit();

    await waitFor( () => {
      expect( mockFetchUserLocation ).toHaveBeenCalled();
    }, { timeout: LOCATION_FETCH_INTERVAL * 2 } );
    // Note: it would be nice to look for an update in the UI, but since we've
    // mocked ObsEditProvider here, it will never update. Might be good for
    // an integration test
  } );

  test( "shouldn't fetch location for existing obs on device that hasn't uploaded", async () => {
    const observation = factory( "LocalObservation", {
      _created_at: faker.date.past( ),
      latitude: Number( faker.address.latitude( ) ),
      longitude: Number( faker.address.longitude( ) ),
      observationPhotos: []
    } );
    expect( observation.id ).toBeFalsy();
    expect( observation.created_at ).toBeFalsy();
    expect( observation._created_at ).toBeTruthy();
    mockObsEditProviderWithObs( [observation] );
    renderObsEdit();

    expect(
      screen.getByText( new RegExp( `Lat: ${observation.latitude}` ) )
    ).toBeTruthy();

    // Location may not fetch immediately, so wait for twice the default fetch
    // interval before testing whether the mock was called
    await waitFor( () => {}, { timeout: LOCATION_FETCH_INTERVAL * 2 } );

    expect( mockFetchUserLocation ).not.toHaveBeenCalled();
  } );

  test( "shouldn't fetch location for existing observation created elsewhere", async () => {
    const observation = factory( "LocalObservation", {
      id: faker.datatype.number(),
      created_at: faker.date.past(),
      _synced_at: faker.date.past(),
      latitude: Number( faker.address.latitude( ) ),
      longitude: Number( faker.address.longitude( ) ),
      observationPhotos: []
    } );
    expect( observation.id ).toBeTruthy();
    expect( observation.created_at ).toBeTruthy();
    mockObsEditProviderWithObs( [observation] );
    renderObsEdit();

    expect(
      screen.getByText( new RegExp( `Lat: ${observation.latitude}` ) )
    ).toBeTruthy();

    await waitFor( () => {}, { timeout: LOCATION_FETCH_INTERVAL * 2 } );

    expect( mockFetchUserLocation ).not.toHaveBeenCalled();
  } );
} );
