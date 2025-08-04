import {
  screen,
  userEvent,
  waitFor
} from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import { renderAppWithObservations } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

const initialStoreState = useStore.getState( );

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

const mockUser = factory( "LocalUser" );

const topSuggestion = {
  taxon: factory.states( "genus" )( "RemoteTaxon", {
    name: "Primum",
    ancestors: [
      factory( "RemoteTaxon", {
        name: "Primum ancestor"
      } )
    ]
  } ),
  combined_score: 90
};

const makeMockObservations = ( ) => ( [
  factory( "RemoteObservation", {
    // Suggestions won't load without a photo
    observationPhotos: [
      factory( "LocalObservationPhoto" )
    ],
    taxon: factory( "LocalTaxon" ),
    user: mockUser
  } )
] );

const mockTaxaList = [
  factory( "RemoteTaxon" ),
  factory( "RemoteTaxon" )
];

describe( "TaxonDetails", ( ) => {
  beforeAll( async () => {
    // userEvent recommends fake timers
    jest.useFakeTimers( );
    useStore.setState( initialStoreState, true );
  } );

  const actor = userEvent.setup( );
  beforeEach( async ( ) => {
    await signIn( mockUser, { realm: global.mockRealms[__filename] } );
    const mockScoreImageResponse = makeResponse( [topSuggestion] );
    inatjs.computervision.score_image.mockResolvedValue( mockScoreImageResponse );
    // We visit TaxonDetails for several taxa in these tests, so this needs to
    // return a unique response for each of them
    inatjs.taxa.fetch.mockImplementation( ( id, _params, _opts ) => {
      const taxon = mockTaxaList.find( t => t.id === id );
      return makeResponse( [taxon || topSuggestion.taxon] );
    } );
    inatjs.taxa.search.mockResolvedValue( makeResponse( mockTaxaList ) );
    inatjs.search.mockResolvedValue( makeResponse( mockTaxaList.map( x => ( { taxon: x } ) ) ) );
  } );

  afterEach( ( ) => {
    signOut( { realm: global.mockRealms[__filename] } );
    inatjs.computervision.score_image.mockReset( );
    inatjs.taxa.fetch.mockReset( );
    inatjs.taxa.search.mockReset( );
  } );

  async function expectToBeOnSuggestions( ) {
    const topIdTitle = await screen.findByText( "TOP ID SUGGESTION" );
    // We used toBeVisible here but the update to RN0.77 broke this expectation
    expect( topIdTitle ).toBeOnTheScreen( );
  }

  // navigate to ObsEdit -> Suggestions -> TaxonSearch -> TaxonDetails
  async function navigateToTaxonDetailsViaTaxonSearch( observation ) {
    const observationGridItem = await screen.findByTestId(
      `MyObservations.obsGridItem.${observation.uuid}`
    );
    await actor.press( observationGridItem );
    const editButton = await screen.findByLabelText( /Edit/ );
    // We used toBeVisible here but the update to RN0.77 broke this expectation
    expect( editButton ).toBeOnTheScreen( );
    await actor.press( editButton );
    const observationTaxonName = await screen.findByText( observation.taxon.name );
    await actor.press( observationTaxonName );
    // navigate to search screen and search for something and tap first result
    await expectToBeOnSuggestions( );
    const searchNav = await screen.findByLabelText( "Search" );
    await actor.press( searchNav );
    const searchBar = await screen.findByTestId( "SearchTaxon" );
    await actor.type( searchBar, "b" );

    const searchedTaxon = mockTaxaList[0];
    await waitFor( async ( ) => {
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( await screen.findByText( searchedTaxon.name ) ).toBeOnTheScreen( );
    } );
    const searchedTaxonName = await screen.findByText( searchedTaxon.name );
    await actor.press( searchedTaxonName );

    const taxonDetailsScreen = await screen.findByTestId( `TaxonDetails.${searchedTaxon.id}` );
    // We used toBeVisible here but the update to RN0.77 broke this expectation
    expect( taxonDetailsScreen ).toBeOnTheScreen( );
    return mockTaxaList[0];
  }

  it(
    "should create an observation with false vision attribute when reached from TaxonSearch",
    async ( ) => {
      const observations = makeMockObservations( );
      useStore.setState( {
        observations,
        currentObservation: observations[0]
      } );
      await renderAppWithObservations( observations, __filename );
      const searchedTaxon = await navigateToTaxonDetailsViaTaxonSearch( observations[0] );
      // make sure we're on TaxonDetails
      const selectTaxonButton = screen.getByText( /SELECT THIS TAXON/ );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( selectTaxonButton ).toBeOnTheScreen( );
      await actor.press( selectTaxonButton );
      // return to ObsEdit screen
      const obsEditBackButton = screen.getByTestId( "ObsEdit.BackButton" );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( obsEditBackButton ).toBeOnTheScreen( );
      // We just chose searchedTaxon, so that name should be visible on ObsEdit
      const selectedTaxonName = await screen.findByText( searchedTaxon.name );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( selectedTaxonName ).toBeOnTheScreen( );
      const { currentObservation } = useStore.getState( );
      expect( currentObservation.owners_identification_from_vision ).toBeFalsy( );
    }
  );
} );
