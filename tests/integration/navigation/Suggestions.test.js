import {
  act,
  screen,
  userEvent
} from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import useStore from "stores/useStore";
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
      useRealm: ( ) => global.mockRealms[mockRealmIdentifier]
    }
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const makeMockObservations = ( ) => ( [
  factory( "LocalObservation", {
    // Suggestions won't load without a photo
    observationPhotos: [
      factory( "LocalObservationPhoto" )
    ],
    geoprivacy: "obscured"
  } )
] );

describe( "Suggestions", ( ) => {
  const actor = userEvent.setup( );

  // We need to navigate from MyObs to ObsEdit to Suggestions for all of these
  // tests
  async function navigateToSuggestionsForObservation( observation ) {
    const observationRow = await screen.findByTestId(
      `MyObservations.obsListItem.${observation.uuid}`
    );
    await actor.press( observationRow );
    const addIdButton = await screen.findByText( "ADD AN ID" );
    await actor.press( addIdButton );
  }

  beforeAll( async () => {
    // userEvent recommends fake timers
    jest.useFakeTimers( );
  } );

  describe( "when reached from ObsEdit", ( ) => {
    // Mock the response from inatjs.computervision.score_image
    const topSuggestion = {
      taxon: factory( "RemoteTaxon", { name: "Primum suggestion" } ),
      combined_score: 90
    };
    const otherSuggestion = {
      taxon: factory( "RemoteTaxon", { name: "Alia suggestione" } ),
      combined_score: 50
    };
    beforeEach( ( ) => {
      const mockScoreImageResponse = makeResponse( [topSuggestion, otherSuggestion] );
      inatjs.computervision.score_image.mockResolvedValue( mockScoreImageResponse );
      inatjs.observations.observers.mockResolvedValue( makeResponse( ) );
      inatjs.taxa.fetch.mockResolvedValue( makeResponse( [topSuggestion.taxon] ) );
    } );

    afterEach( ( ) => {
      inatjs.computervision.score_image.mockReset( );
      inatjs.observations.observers.mockReset( );
      inatjs.taxa.fetch.mockReset( );
    } );

    it(
      "should navigate back to ObsEdit with expected observation when top suggestion chosen",
      async ( ) => {
        const observations = makeMockObservations( );
        useStore.setState( { observations } );
        await renderAppWithObservations( observations, __filename );
        await navigateToSuggestionsForObservation( observations[0] );
        const topTaxonResultButton = await screen.findByTestId(
          `SuggestionsList.taxa.${topSuggestion.taxon.id}.checkmark`
        );
        expect( topTaxonResultButton ).toBeTruthy( );
        await actor.press( topTaxonResultButton );
        expect( await screen.findByText( "EVIDENCE" ) ).toBeTruthy( );
        expect( await screen.findByText( /Obscured/ ) ).toBeVisible( );
      }
    );

    it( "should navigate back to ObsEdit when another suggestion chosen", async ( ) => {
      const observations = makeMockObservations( );
      await renderAppWithObservations( observations, __filename );
      await navigateToSuggestionsForObservation( observations[0] );
      const otherTaxonResultButton = await screen.findByTestId(
        `SuggestionsList.taxa.${otherSuggestion.taxon.id}.checkmark`
      );
      expect( otherTaxonResultButton ).toBeTruthy( );
      await actor.press( otherTaxonResultButton );
      expect( await screen.findByText( "EVIDENCE" ) ).toBeTruthy( );
    } );
  } );

  describe( "TaxonSearch", ( ) => {
    it(
      "should navigate back to ObsEdit with expected observation"
      + " when reached from ObsEdit via Suggestions and search result chosen",
      async ( ) => {
        const observations = [
          factory( "LocalObservation", { geoprivacy: "obscured" } )
        ];
        useStore.setState( { observations } );
        await renderAppWithObservations( observations, __filename );
        await navigateToSuggestionsForObservation( observations[0] );
        const searchButton = await screen.findByText( "SEARCH FOR A TAXON" );
        await actor.press( searchButton );
        const searchInput = await screen.findByLabelText( "Search for a taxon" );
        const mockSearchResultTaxon = factory( "RemoteTaxon" );
        inatjs.search.mockResolvedValue( makeResponse( [
          {
            taxon: mockSearchResultTaxon
          }
        ] ) );
        await act(
          async ( ) => actor.type(
            searchInput,
            "doesn't really matter since we're mocking the response"
          )
        );
        const taxonResultButton = await screen.findByTestId(
          `Search.taxa.${mockSearchResultTaxon.id}.checkmark`
        );
        expect( taxonResultButton ).toBeTruthy( );
        await actor.press( taxonResultButton );
        expect( await screen.findByText( "EVIDENCE" ) ).toBeTruthy( );
        expect( await screen.findByText( /Obscured/ ) ).toBeVisible( );
      }
    );
  } );
} );
