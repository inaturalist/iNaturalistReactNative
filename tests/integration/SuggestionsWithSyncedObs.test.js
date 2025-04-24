import {
  act,
  screen,
  userEvent,
  waitFor,
  within
} from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import Identification from "realmModels/Identification";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderAppWithObservations } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut, TEST_JWT } from "tests/helpers/user";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier
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
      useQuery: ( ) => []
    }
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const initialStoreState = useStore.getState( );
beforeAll( async ( ) => {
  useStore.setState( initialStoreState, true );
  useStore.setState( {
    layout: {
      isDefaultMode: false
    }
  } );
  // userEvent recommends fake timers
  jest.useFakeTimers( );
} );

const mockUser = factory( "LocalUser" );

const makeMockObservations = ( ) => ( [
  factory( "RemoteObservation", {
    _synced_at: faker.date.past( ),
    needsSync: jest.fn( ( ) => false ),
    wasSynced: jest.fn( ( ) => true ),
    // Suggestions won't load without a photo
    observationPhotos: [
      factory( "RemoteObservationPhoto" ),
      factory( "RemoteObservationPhoto" )
    ],
    user: mockUser,
    observed_on_string: "2020-01-01"
  } )
] );

// Mock the response from inatjs.computervision.score_image
const topSuggestion = {
  taxon: factory.states( "genus" )( "RemoteTaxon", { name: "Primum" } ),
  combined_score: 90
};
const otherSuggestion = {
  taxon: factory( "RemoteTaxon", { name: "Alia suggestione" } ),
  combined_score: 50
};

beforeEach( async ( ) => {
  const mockScoreImageResponse = makeResponse( [topSuggestion, otherSuggestion] );
  inatjs.computervision.score_image.mockResolvedValue( mockScoreImageResponse );
  inatjs.observations.observers.mockResolvedValue( makeResponse( ) );
  inatjs.taxa.fetch.mockResolvedValue( makeResponse( [topSuggestion.taxon] ) );
  inatjs.observations.viewedUpdates.mockResolvedValue( makeResponse( ) );
  inatjs.identifications.create.mockResolvedValue( {
    results: [factory( "RemoteIdentification", {
      taxon: topSuggestion.taxon,
      user: mockUser
    } )]
  } );
  await signIn( mockUser, { realm: global.mockRealms[__filename] } );
} );

afterEach( ( ) => {
  inatjs.computervision.score_image.mockReset( );
  inatjs.observations.observers.mockReset( );
  inatjs.taxa.fetch.mockReset( );
  inatjs.observations.viewedUpdates.mockReset( );
  inatjs.identifications.create.mockReset( );
  signOut( { realm: global.mockRealms[__filename] } );
} );

// TODO: Fix failing TaxonSearch tests: Unable to find node on an unmounted component error

// describe( "TaxonSearch", ( ) => {
//   const mockSearchResultTaxon = factory( "RemoteTaxon" );

//   beforeEach( ( ) => {
//     inatjs.taxa.search.mockResolvedValue( makeResponse( [
//       mockSearchResultTaxon
//     ] ) );
//     inatjs.observations.observers.mockResolvedValue( makeResponse( [
//       {
//         observation_count: faker.number.int( ),
//         species_count: faker.number.int( ),
//         user: factory( "RemoteUser" )
//       }
//     ] ) );
//     inatjs.taxa.fetch.mockResolvedValue( makeResponse( [] ) );
//   } );

//   afterEach( ( ) => {
//     inatjs.taxa.search.mockReset( );
//     inatjs.observations.observers.mockReset( );
//     inatjs.taxa.fetch.mockReset( );
//   } );

//   const actor = userEvent.setup( );

//   // We need to navigate from MyObs to ObsDetails to Suggestions to TaxonSearch for all of these
//   // tests
//   async function navigateToTaxonSearchForObservation( observation ) {
//     const observationGridItem = await screen.findByTestId(
//       `MyObservations.obsGridItem.${observation.uuid}`
//     );
//     await actor.press( observationGridItem );
//     const suggestIdButton = await screen.findByText( "SUGGEST ID" );
//     await act( async ( ) => actor.press( suggestIdButton ) );
//     await screen.findByTestId(
//       `SuggestionsList.taxa.${topSuggestion.taxon.id}.checkmark`
//     );
//     const searchButton = await screen.findByText( "SEARCH FOR A TAXON" );
//     await actor.press( searchButton );
//   }

//   async function navigateToTaxonSearchForObservationViaObsEdit( observation ) {
//     const observationGridItem = await screen.findByTestId(
//       `MyObservations.obsGridItem.${observation.uuid}`
//     );
//     await actor.press( observationGridItem );
//     const editButton = await screen.findByLabelText( "Edit" );
//     await act( async ( ) => actor.press( editButton ) );
//     const addIdButton = await screen.findByText( "ADD AN ID" );
//     await actor.press( addIdButton );
//     await screen.findByTestId(
//       `SuggestionsList.taxa.${topSuggestion.taxon.id}.checkmark`
//     );
//     const searchButton = await screen.findByText( "SEARCH FOR A TAXON" );
//     await actor.press( searchButton );
//   }

//   it(
//     "should create an id with false vision attribute when reached from ObsDetails via"
//     + " Suggestions and search result chosen",
//     async ( ) => {
//       const { observations } = await setupAppWithSignedInUser( );
//       await navigateToTaxonSearchForObservation( observations[0] );
//       const searchInput = await screen.findByLabelText( "Search for a taxon" );
//       expect( searchInput ).toBeVisible( );
//       await act(
//         async ( ) => actor.type(
//           searchInput,
//           "doesn't really matter since we're mocking the response"
//         )
//       );
//       const taxonResultButton = await screen.findByTestId(
//         `Search.taxa.${mockSearchResultTaxon.id}.checkmark`
//       );
//       expect( taxonResultButton ).toBeTruthy( );
//       await actor.press( taxonResultButton );
//       expect( await screen.findByText( "ACTIVITY" ) ).toBeTruthy( );
//       expect( inatjs.identifications.create ).toHaveBeenCalledWith( {
//         fields: Identification.ID_FIELDS,
//         identification: {
//           observation_id: observations[0].uuid,
//           taxon_id: mockSearchResultTaxon.id,
//           vision: false
//         }
//       }, {
//         api_token: TEST_JWT
//       } );
//     }
//   );

//   it(
//     "should update observation with false vision attribute when reached from ObsEdit"
//     + " and search result chosen",
//     async ( ) => {
//       const { observations } = await setupAppWithSignedInUser( );
//       await navigateToTaxonSearchForObservationViaObsEdit( observations[0] );
//       const searchInput = await screen.findByLabelText( "Search for a taxon" );
//       await act(
//         async ( ) => actor.type(
//           searchInput,
//           "doesn't really matter since we're mocking the response"
//         )
//       );
//       const taxonResultButton = await screen.findByTestId(
//         `Search.taxa.${mockSearchResultTaxon.id}.checkmark`
//       );
//       expect( taxonResultButton ).toBeTruthy( );
//       await actor.press( taxonResultButton );
//       const saveChangesButton = await screen.findByText( "SAVE CHANGES" );
//       expect( saveChangesButton ).toBeTruthy( );
//       await actor.press( saveChangesButton );
//       const savedObservation = global.mockRealms[__filename]
//         .objectForPrimaryKey( "Observation", observations[0].uuid );
//       expect( savedObservation ).toHaveProperty( "owners_identification_from_vision", false );
//     }
//   );
// } );

describe( "Suggestions", ( ) => {
  const actor = userEvent.setup( );

  // We need to navigate from MyObs to ObsDetails to Suggestions for all of these
  // tests
  const navigateToSuggestionsForObservation = async observation => {
    const observationGridItem = await screen.findByTestId(
      `MyObservations.obsGridItem.${observation.uuid}`
    );
    await actor.press( observationGridItem );
    const suggestIdButton = await screen.findByText( "SUGGEST ID" );
    await act( async ( ) => actor.press( suggestIdButton ) );
  };

  const navigateToSuggestionsForObservationViaObsEdit = async observation => {
    const observationGridItem = await screen.findByTestId(
      `MyObservations.obsGridItem.${observation.uuid}`
    );
    await actor.press( observationGridItem );
    const editButton = await screen.findByLabelText( "Edit" );
    await act( async ( ) => actor.press( editButton ) );
    const addIdButton = await screen.findByText( "ID WITH AI" );
    await actor.press( addIdButton );
  };

  const setupAppWithSignedInUser = async ( ) => {
    const observations = makeMockObservations( );
    useStore.setState( { observations } );
    await renderAppWithObservations( observations, __filename );
    return { observations };
  };

  it( "should create ident with vision=true via ObsDetails", async ( ) => {
    const { observations } = await setupAppWithSignedInUser( );
    await navigateToSuggestionsForObservation( observations[0] );
    const taxonId = topSuggestion.taxon.id;
    const topTaxonResultButton = await screen.findByTestId(
      `SuggestionsList.taxa.${taxonId}.checkmark`
    );
    expect( topTaxonResultButton ).toBeVisible( );
    await actor.press( topTaxonResultButton );
    const activityTabBtn = await screen.findByText( /ACTIVITY/ );
    expect( activityTabBtn ).toBeVisible( );
    await actor.press( activityTabBtn );
    const activityTab = await screen.findByTestId( "ActivityTab" );
    expect( activityTab ).toBeVisible( );
    // open bottom sheet
    const bottomSheetText = await screen.findByText(
      /Would you like to suggest the following identification/
    );
    expect( bottomSheetText ).toBeVisible( );
    const confirmButton = await screen.findByTestId( "SuggestIDSheet.cvSuggestionsButton" );
    expect( confirmButton ).toBeVisible( );
    await actor.press( confirmButton );
    // Wait for the actual identification we created to appear
    const taxonNameInIdent = await within( activityTab ).findByText( topSuggestion.taxon.name );
    expect( taxonNameInIdent ).toBeVisible( );
    expect( inatjs.identifications.create ).toHaveBeenCalledWith( {
      fields: Identification.ID_FIELDS,
      identification: {
        observation_id: observations[0].uuid,
        taxon_id: taxonId,
        vision: true
      }
    }, {
      api_token: TEST_JWT
    } );
  } );

  it( "should update observation with vision=true via ObsEdit", async ( ) => {
    const { observations } = await setupAppWithSignedInUser( );
    await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
    const topTaxonResultButton = await screen.findByTestId(
      `SuggestionsList.taxa.${topSuggestion.taxon.id}.checkmark`
    );
    expect( topTaxonResultButton ).toBeTruthy( );
    await actor.press( topTaxonResultButton );
    const saveChangesButton = await screen.findByText( "SAVE CHANGES" );
    expect( saveChangesButton ).toBeTruthy( );
    await actor.press( saveChangesButton );
    // Ensure we're back on MyObs
    const observationGridItem = await screen.findByTestId(
      `MyObservations.obsGridItem.${observations[0].uuid}`
    );
    await waitFor( ( ) => {
      expect( observationGridItem ).toBeVisible( );
    }, { timeout: 3000, interval: 500 } );
    const savedObservation = global.mockRealms[__filename]
      .objectForPrimaryKey( "Observation", observations[0].uuid );
    expect( savedObservation ).toHaveProperty( "owners_identification_from_vision", true );
  } );

  it.todo( "should create an identification when accessed from Explore" );
} );
