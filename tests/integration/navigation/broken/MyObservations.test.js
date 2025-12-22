import {
  screen, userEvent, waitFor,
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderApp } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

const mockUnsyncedObservations = [
  factory( "LocalObservation", {
    _synced_at: null,
    _created_at: faker.date.past( ),
    observed_on_string: "2024-05-01",
    latitude: 1.2345,
    longitude: 1.2345,
    taxon: factory( "LocalTaxon" ),
  } ),
  factory( "LocalObservation", {
    _synced_at: null,
    _created_at: faker.date.past( ),
    observed_on_string: "2024-05-02",
    latitude: 1.2345,
    longitude: 1.2345,
    taxon: factory( "LocalTaxon" ),
  } ),
  factory( "LocalObservation", {
    _synced_at: null,
    _created_at: faker.date.past( ),
    observed_on_string: "2024-05-03",
    latitude: 1.2345,
    longitude: 1.2345,
    taxon: factory( "LocalTaxon" ),
  } ),
];

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  iconUrl: faker.image.url( ),
  locale: "en",
} );

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

beforeAll( async () => {
  await initI18next( );
  jest.useFakeTimers( );
} );

// Mock the response from inatjs.computervision.score_image
const topSuggestion = {
  taxon: factory.states( "genus" )( "RemoteTaxon", { name: "Primum" } ),
  combined_score: 90,
};

const actor = userEvent.setup( );

beforeEach( ( ) => {
  setStoreStateLayout( {
    isDefaultMode: false,
    isAllAddObsOptionsMode: true,
  } );
  inatjs.computervision.score_image.mockResolvedValue( makeResponse( [topSuggestion] ) );
} );

const checkToolbarResetWithUnsyncedObs = ( ) => waitFor( ( ) => {
  const toolbarText = screen.getByText( /Upload 3 observations/ );
  // We used toBeVisible here but the update to RN0.77 broke this expectation
  expect( toolbarText ).toBeOnTheScreen();
} );

const writeObservationsToRealm = ( observations, message ) => {
  const realm = global.mockRealms[__filename];
  safeRealmWrite( realm, ( ) => {
    observations.forEach( mockObservation => {
      realm.create( "Observation", mockObservation );
    } );
  }, message );
};

const pressIndividualUpload = observation => {
  const uploadIcon = screen.getByTestId(
    `UploadIcon.start.${observation.uuid}`,
  );
  // We used toBeVisible here but the update to RN0.77 broke this expectation
  expect( uploadIcon ).toBeOnTheScreen( );
  actor.press( uploadIcon );
};

const waitForDisplayedText = async ( text, timeout = 1000 ) => {
  await waitFor( ( ) => {
    // We used toBeVisible here but the update to RN0.77 broke this expectation
    expect( screen.getByText( text ) ).toBeOnTheScreen( );
  }, { timeout } );
};

const pressButtonByLabel = async labelText => {
  const button = screen.getByLabelText( labelText );
  await actor.press( button );
};

const pressButtonByText = async text => {
  const button = screen.getByText( text );
  await actor.press( button );
};

// const deleteObservationByTaxonName = async name => {
//   await pressButtonByText( name );
//   await waitForDisplayedText( /Edit Observation/ );
//   await pressButtonByLabel( /Menu/ );
//   await pressButtonByText( /Delete observation/ );
//   await pressButtonByText( "DELETE" );
//   await waitForDisplayedText( /1 observation deleted/ );
// };

describe( "MyObservations -> ObsEdit no evidence -> MyObservations", ( ) => {
  // Mock inatjs endpoints so they return the right responses for the right test data
  inatjs.observations.create.mockImplementation( ( params, _opts ) => {
    const mockObs = mockUnsyncedObservations.find( o => o.uuid === params.observation.uuid );
    return Promise.resolve( makeResponse( [{ id: faker.number.int( ), uuid: mockObs.uuid }] ) );
  } );
  inatjs.observations.fetch.mockImplementation( ( uuid, _params, _opts ) => {
    const mockObs = mockUnsyncedObservations.find( o => o.uuid === uuid );
    // It would be a lot better if this returned something that looks like
    // a remote obs, but this works
    return Promise.resolve( makeResponse( [mockObs] ) );
  } );

  beforeEach( async ( ) => {
    await signIn( mockUser, { realm: global.mockRealms[__filename] } );
    writeObservationsToRealm(
      mockUnsyncedObservations,
      "writing observations for MyObservations navigation test",
    );
  } );

  afterEach( async ( ) => {
    await signOut( { realm: global.mockRealms[__filename] } );
  } );

  it( "should display fresh toolbar status after uploading an observation, then"
    + " navigating away and returning to MyObs", async ( ) => {
    renderApp( );
    await checkToolbarResetWithUnsyncedObs( );
    pressIndividualUpload( mockUnsyncedObservations[0] );
    await waitForDisplayedText( /1 observation uploaded/ );
    await pressButtonByLabel( /Add observations/ );
    await pressButtonByLabel( /Observation with no evidence/ );
    await pressButtonByText( /SAVE/ );
    // missing evidence sheet pops up here, so need to press SAVE twice
    await pressButtonByText( "OK" );
    await pressButtonByText( /SAVE/ );
    await waitForDisplayedText( /Upload 3 observations/, 5000 );
  } );

  // it( "should display fresh toolbar status after deleting an observation, then"
  //   + " navigating away, deleting a second observation, and returning to MyObs", async ( ) => {
  //   renderApp( );
  //   await checkToolbarResetWithUnsyncedObs( );
  //   await deleteObservationByTaxonName( mockUnsyncedObservations[0].taxon.name );
  //   await deleteObservationByTaxonName( mockUnsyncedObservations[1].taxon.name );
  // } );

  // it.todo(
  //   "should display empty MyObs screen after all three observations are deleted",
  //   async ( ) => {
  //     renderApp( );
  //     await checkToolbarResetWithUnsyncedObs( );
  //     await deleteObservationByTaxonName( mockUnsyncedObservations[0].taxon.name );
  //     await deleteObservationByTaxonName( mockUnsyncedObservations[1].taxon.name );
  //     await deleteObservationByTaxonName( mockUnsyncedObservations[2].taxon.name );
  //     await waitForDisplayedText( /CREATE YOUR FIRST OBSERVATION/ );
  //   }
  // );
} );
