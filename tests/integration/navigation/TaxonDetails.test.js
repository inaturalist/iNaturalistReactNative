import {
  act,
  screen,
  userEvent
} from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import factory, { makeResponse } from "tests/factory";
import { renderAppWithObservations } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

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

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => mockUser
} ) );

const topSuggestion = {
  taxon: factory.states( "genus" )( "RemoteTaxon", { name: "Primum" } ),
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

describe( "TaxonDetails", ( ) => {
  beforeAll( async () => {
    // userEvent recommends fake timers
    jest.useFakeTimers( );
  } );

  const actor = userEvent.setup( );
  beforeEach( ( ) => {
    const mockScoreImageResponse = makeResponse( [topSuggestion] );
    inatjs.computervision.score_image.mockResolvedValue( mockScoreImageResponse );
    inatjs.taxa.fetch.mockResolvedValue( makeResponse( [topSuggestion.taxon] ) );
  } );

  afterEach( ( ) => {
    inatjs.computervision.score_image.mockReset( );
    inatjs.taxa.fetch.mockReset( );
  } );

  // navigate to ObsDetails -> Suggest ID -> Suggestions -> TaxonDetails
  async function navigateToTaxonDetailsViaSuggestId( observation ) {
    const { taxon } = topSuggestion;
    const observationRow = await screen.findByTestId(
      `MyObservations.obsListItem.${observation.uuid}`
    );
    await actor.press( observationRow );
    const suggestIdButton = await screen.findByText( /SUGGEST ID/ );
    await act( async ( ) => actor.press( suggestIdButton ) );
    const suggestedTaxonName = await screen.findByText( taxon.name );
    await actor.press( suggestedTaxonName );
    const taxonDetailsScreen = await screen.findByTestId( `TaxonDetails.${taxon.id}` );
    expect( taxonDetailsScreen ).toBeVisible( );
  }

  // navigate to ObsEdit -> Suggestions -> TaxonDetails
  async function navigateToTaxonDetailsViaObsEdit( observation ) {
    const { taxon } = topSuggestion;
    const observationRow = await screen.findByTestId(
      `MyObservations.obsListItem.${observation.uuid}`
    );
    await actor.press( observationRow );
    const editButton = await screen.findByLabelText( /Edit/ );
    expect( editButton ).toBeVisible( );
    await act( async ( ) => actor.press( editButton ) );
    const observationTaxonName = await screen.findByText( observation.taxon.name );
    await actor.press( observationTaxonName );
    const suggestedTaxonName = await screen.findByText( taxon.name );
    await actor.press( suggestedTaxonName );
    const taxonDetailsScreen = await screen.findByTestId( `TaxonDetails.${taxon.id}` );
    expect( taxonDetailsScreen ).toBeVisible( );
  }

  it(
    "should navigate from ObsDetails -> ObsDetails when taxon is selected",
    async ( ) => {
      const { taxon } = topSuggestion;
      const observations = makeMockObservations( );
      await renderAppWithObservations( observations, __filename );
      await navigateToTaxonDetailsViaSuggestId( observations[0] );
      // make sure we're on TaxonDetails
      const selectTaxonButton = screen.getByText( /SELECT THIS TAXON/ );
      expect( selectTaxonButton ).toBeVisible( );
      await actor.press( selectTaxonButton );
      // return to ObsDetails screen
      expect( await screen.findByTestId( `ObsDetails.${observations[0].uuid}` ) ).toBeTruthy( );
      // suggest ID should be popped open with the suggested taxon
      const bottomSheetText = await screen.findByText(
        /Would you like to suggest the following identification/
      );
      expect( bottomSheetText ).toBeVisible( );
      const selectedTaxonName = await screen.findByText( taxon.name );
      expect( selectedTaxonName ).toBeVisible( );
    }
  );

  it(
    "should navigate from obs create -> ObsEdit when taxon is selected",
    async ( ) => {
      const { taxon } = topSuggestion;
      const observations = makeMockObservations( );
      await renderAppWithObservations( observations, __filename );
      await navigateToTaxonDetailsViaObsEdit( observations[0] );
      // make sure we're on TaxonDetails
      const selectTaxonButton = screen.getByText( /SELECT THIS TAXON/ );
      expect( selectTaxonButton ).toBeVisible( );
      await actor.press( selectTaxonButton );
      // return to ObsEdit screen
      const obsEditBackButton = screen.getByTestId( "ObsEdit.BackButton" );
      expect( obsEditBackButton ).toBeVisible( );
      const selectedTaxonName = await screen.findByText( taxon.name );
      expect( selectedTaxonName ).toBeVisible( );
    }
  );
} );
