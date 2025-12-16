import Geolocation from "@react-native-community/geolocation";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import inatjs from "inaturalistjs";
import React from "react";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn } from "tests/helpers/user";

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier,
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[mockRealmIdentifier],
      useQuery: ( ) => [],
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const initialStoreState = useStore.getState( );

const mockLocationName = "San Francisco, CA";

const mockCurrentUser = factory( "LocalUser" );

const renderObsEdit = ( ) => renderComponent( <ObsEdit /> );

const mockTaxon = factory( "RemoteTaxon", {
  name: faker.person.firstName( ),
  rank: "genus",
  rank_level: 27,
  preferred_common_name: faker.person.fullName( ),
  default_photo: {
    square_url: faker.image.url( ),
  },
  ancestors: [{
    id: faker.number.int( ),
    preferred_common_name: faker.person.fullName( ),
    name: faker.person.fullName( ),
    rank: "class",
  }],
  wikipedia_summary: faker.lorem.paragraph( ),
  taxonPhotos: [{
    photo: factory( "RemotePhoto" ),
  }],
  wikipedia_url: faker.internet.url( ),
} );

const mockObservation = factory( "RemoteObservation", {
  latitude: 37.99,
  longitude: -142.88,
  user: mockCurrentUser,
  place_guess: mockLocationName,
  taxon: mockTaxon,
  observationPhotos: [],
} );

const mockObservations = [mockObservation];

const mockMultipleObservations = Array.from(
  { length: 6 },
  () => factory( "RemoteObservation", {
    latitude: 37.99,
    longitude: -142.88,
    user: mockCurrentUser,
    place_guess: mockLocationName,
    taxon: mockTaxon,
    observationPhotos: [],
  } ),
);

describe( "basic rendering", ( ) => {
  beforeAll( async () => {
    useStore.setState( initialStoreState, true );
  } );

  it( "should render place_guess and latitude", async ( ) => {
    const observations = [factory( "RemoteObservation", {
      latitude: 37.99,
      longitude: -142.88,
      user: mockCurrentUser,
      place_guess: mockLocationName,
      taxon: mockTaxon,
      observationPhotos: [],
    } )];

    useStore.setState( {
      observations: mockObservations,
      currentObservation: mockObservations[0],
    } );
    renderObsEdit( );
    const obs = observations[0];

    expect( await screen.findByText( obs.place_guess ) ).toBeTruthy( );
    expect( screen.getByText( new RegExp( `${obs.latitude}` ) ) ).toBeTruthy( );
  } );
} );

describe( "location fetching", () => {
  beforeAll( async () => {
    useStore.setState( initialStoreState, true );
  } );

  beforeEach( () => {
    // resets mock back to original state
    Geolocation.watchPosition.mockClear();
  } );

  test( "should fetch location when new observation hasn't saved", async ( ) => {
    const observations = [factory( "LocalObservation", {
      observationPhotos: [],
    } )];
    useStore.setState( {
      observations,
      currentObservation: observations[0],
    } );

    renderObsEdit( );

    await waitFor( () => {
      expect( Geolocation.watchPosition ).toHaveBeenCalled();
    } );
    // Note: it would be nice to look for an update in the UI
  } );

  test( "shouldn't fetch location for existing obs on device that hasn't uploaded", async () => {
    const observation = factory( "LocalObservation", {
      _created_at: faker.date.past( ),
      latitude: Number( faker.location.latitude( ) ),
      longitude: Number( faker.location.longitude( ) ),
      observationPhotos: [],
    } );
    expect( observation.id ).toBeFalsy();
    expect( observation.created_at ).toBeFalsy();
    expect( observation._created_at ).toBeTruthy();
    useStore.setState( {
      observations: [observation],
      currentObservation: observation,
    } );
    renderObsEdit( );

    expect(
      screen.getByText( new RegExp( `Lat: ${observation.latitude}` ) ),
    ).toBeTruthy();

    // Location may not fetch immediately, so wait for twice the default fetch
    // interval before testing whether the mock was called
    await waitFor( () => undefined );

    expect( Geolocation.watchPosition ).not.toHaveBeenCalled();
  } );

  test( "shouldn't fetch location for existing observation created elsewhere", async () => {
    const observation = factory( "LocalObservation", {
      id: faker.number.int(),
      created_at: faker.date.past(),
      _synced_at: faker.date.past(),
      latitude: Number( faker.location.latitude( ) ),
      longitude: Number( faker.location.longitude( ) ),
      observationPhotos: [],
    } );
    expect( observation.id ).toBeTruthy();
    expect( observation.created_at ).toBeTruthy();
    useStore.setState( {
      observations: [observation],
      currentObservation: observation,
    } );
    renderObsEdit( );

    expect(
      screen.getByText( new RegExp( `Lat: ${observation.latitude}` ) ),
    ).toBeTruthy();

    await waitFor( () => undefined );

    expect( Geolocation.watchPosition ).not.toHaveBeenCalled();
  } );
} );

describe( "multiple observation upload/save progress", ( ) => {
  beforeEach( async ( ) => {
    await signIn( mockCurrentUser, { realm: global.mockRealms[__filename] } );
    useStore.setState( {
      observations: mockMultipleObservations,
      currentObservation: mockMultipleObservations[0],
    } );
  } );

  afterEach( async ( ) => {
    useStore.setState( { } );
  } );

  test( "should show upload status when upload button pressed", async ( ) => {
    inatjs.observations.create.mockImplementation(
      ( params, _opts ) => Promise.resolve( makeResponse( [{
        id: faker.number.int(),
        uuid: params.observation.uuid,
      }] ) ),
    );
    renderObsEdit( );
    const uploadButton = await screen.findByText( /UPLOAD/ );
    fireEvent.press( uploadButton );
    const uploadedText = await screen.findByText( /1 uploaded/ );
    await waitFor( ( ) => {
      expect( uploadedText ).toBeVisible( );
    } );
  } );

  test( "should show saved status when saved button pressed", async ( ) => {
    renderObsEdit( );
    const saveButton = await screen.findByText( /SAVE/ );
    fireEvent.press( saveButton );
    const savingText = await screen.findByText( /1 saved/ );
    await waitFor( ( ) => {
      expect( savingText ).toBeVisible( );
    } );
  } );

  test( "should show both saved and uploading status when saved and upload"
    + " button pressed", async ( ) => {
    inatjs.observations.create.mockImplementation(
      ( params, _opts ) => Promise.resolve( makeResponse( [{
        id: faker.number.int(),
        uuid: params.observation.uuid,
      }] ) ),
    );
    renderObsEdit( );
    const saveButton = await screen.findByText( /SAVE/ );
    fireEvent.press( saveButton );
    const savingText = await screen.findByText( /1 saved/ );
    await waitFor( ( ) => {
      expect( savingText ).toBeVisible( );
    } );
    const uploadButton = await screen.findByText( /UPLOAD/ );
    fireEvent.press( uploadButton );
    const uploadedText = await screen.findByText( /1 uploaded/ );
    await waitFor( ( ) => {
      expect( uploadedText ).toBeVisible( );
    } );
  } );

  test( "should show uploaded status when 1 observation is uploaded"
    + " in multi-observation upload flow", async ( ) => {
    inatjs.observations.create.mockImplementation(
      ( params, _opts ) => Promise.resolve( makeResponse( [{
        id: faker.number.int(),
        uuid: params.observation.uuid,
      }] ) ),
    );
    renderObsEdit( );
    const uploadButton = await screen.findByText( /UPLOAD/ );
    fireEvent.press( uploadButton );
    const uploadedText = await screen.findByText( /1 uploaded/ );
    await waitFor( ( ) => {
      expect( uploadedText ).toBeVisible( );
    } );
  } );
} );
