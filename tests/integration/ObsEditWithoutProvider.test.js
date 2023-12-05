import { faker } from "@faker-js/faker";
import { screen, waitFor } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import initI18next from "i18n/initI18next";
import { ObsEditContext } from "providers/contexts";
import React from "react";
import { LOCATION_FETCH_INTERVAL } from "sharedHooks/useCurrentObservationLocation";

import factory from "../factory";
import { renderComponent } from "../helpers/render";

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

const renderObsEdit = obs => renderComponent(
  <ObsEditContext.Provider
    value={{
      observations: obs,
      currentObservation: obs[0],
      updateObservationKeys: jest.fn( ),
      setPassesIdentificationTest: jest.fn( ),
      writeExifToCameraRollPhotos: jest.fn( ),
      photoEvidenceUris: [faker.image.url( )],
      setPhotoEvidenceUris: jest.fn( )
    }}
  >
    <ObsEdit />
  </ObsEditContext.Provider>
);

const mockTaxon = factory( "RemoteTaxon", {
  name: faker.person.firstName( ),
  rank: "genus",
  rank_level: 27,
  preferred_common_name: faker.person.fullName( ),
  default_photo: {
    square_url: faker.image.url( )
  },
  ancestors: [{
    id: faker.number.int( ),
    preferred_common_name: faker.person.fullName( ),
    name: faker.person.fullName( ),
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

    renderObsEdit( observations );

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
    renderObsEdit( observations );
    expect( mockFetchUserLocation ).not.toHaveBeenCalled();

    renderObsEdit( observations );

    await waitFor( () => {
      expect( mockFetchUserLocation ).toHaveBeenCalled();
    }, { timeout: LOCATION_FETCH_INTERVAL * 2 } );
    // Note: it would be nice to look for an update in the UI
  } );

  test( "shouldn't fetch location for existing obs on device that hasn't uploaded", async () => {
    const observation = factory( "LocalObservation", {
      _created_at: faker.date.past( ),
      latitude: Number( faker.location.latitude( ) ),
      longitude: Number( faker.location.longitude( ) ),
      observationPhotos: []
    } );
    expect( observation.id ).toBeFalsy();
    expect( observation.created_at ).toBeFalsy();
    expect( observation._created_at ).toBeTruthy();
    renderObsEdit( [observation] );

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
      id: faker.number.int(),
      created_at: faker.date.past(),
      _synced_at: faker.date.past(),
      latitude: Number( faker.location.latitude( ) ),
      longitude: Number( faker.location.longitude( ) ),
      observationPhotos: []
    } );
    expect( observation.id ).toBeTruthy();
    expect( observation.created_at ).toBeTruthy();
    renderObsEdit( [observation] );

    expect(
      screen.getByText( new RegExp( `Lat: ${observation.latitude}` ) )
    ).toBeTruthy();

    await waitFor( () => {}, { timeout: LOCATION_FETCH_INTERVAL * 2 } );

    expect( mockFetchUserLocation ).not.toHaveBeenCalled();
  } );
} );
