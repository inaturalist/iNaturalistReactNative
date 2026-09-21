import { useNavigation, useRoute } from "@react-navigation/native";
import {
  act, screen, userEvent, waitFor,
} from "@testing-library/react-native";
import IdentificationSheets,
{ identReducer } from "components/ObsDetailsDefaultMode/IdentificationSheets";
import { t } from "i18next";
import React from "react";
import fetchTaxonAndSave from "sharedHelpers/fetchTaxonAndSave";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

jest.mock( "sharedHelpers/fetchTaxonAndSave" );
jest.mock( "sharedHooks/useAuthenticatedMutation" );
jest.mock( "@react-navigation/native", () => ( {
  ...jest.requireActual( "@react-navigation/native" ),
  useRoute: jest.fn(),
  useNavigation: jest.fn(),
} ) );

const mockRealm = {
  objectForPrimaryKey: jest.fn( () => null ),
};

jest.mock( "providers/contexts", () => ( {
  RealmContext: {
    useRealm: () => mockRealm,
  },
} ) );

const mockUser = factory( "LocalUser" );
jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => mockUser,
} ) );

const mockTaxon = factory( "RemoteTaxon" );
const mockObservation = factory( "LocalObservation" );

const mockMutate = jest.fn();

describe( "IdentificationSheets", () => {
  beforeEach( () => {
    jest.clearAllMocks();
    useNavigation.mockReturnValue( { setParams: jest.fn() } );

    useAuthenticatedMutation.mockImplementation( ( mutationFn, options ) => ( {
      mutate: params => {
        mockMutate( params );
        if ( options && options.onSuccess ) {
          options.onSuccess( { id: 1 } );
        }
        if ( options && options.onSettled ) {
          options.onSettled( );
        }
      },
      isPending: false,
    } ) );
  } );

  const defaultProps = {
    agreeIdentification: false,
    closeAgreeWithIdSheet: jest.fn(),
    handleCommentMutationSuccess: jest.fn(),
    handleIdentificationMutationSuccess: jest.fn(),
    hideAddCommentSheet: jest.fn(),
    loadActivityItem: jest.fn(),
    observation: mockObservation,
    showAgreeWithIdSheet: false,
  };

  describe( "SuggestIDSheet", () => {
    it( "shows SuggestIDSheet when identTaxonId is provided via route params", async () => {
      useRoute.mockReturnValue( {
        params: {
          identTaxonId: mockTaxon.id,
          uuid: mockObservation.uuid,
        },
      } );

      fetchTaxonAndSave.mockResolvedValue( mockTaxon );

      renderComponent(
        <IdentificationSheets {...defaultProps} />,
      );

      await waitFor( () => {
        expect( screen.getByText(
          t( "Would-you-like-to-suggest-the-following-identification" ),
        ) ).toBeVisible();
      } );
    } );
  } );

  describe( "Route params", () => {
    it( "fetches taxon from Realm when identTaxonId is provided", async () => {
      const mockRealmTaxon = { ...mockTaxon };

      mockRealm.objectForPrimaryKey.mockReturnValue( mockRealmTaxon );

      useRoute.mockReturnValue( {
        params: {
          identTaxonId: mockTaxon.id,
          uuid: mockObservation.uuid,
        },
      } );

      renderComponent(
        <IdentificationSheets {...defaultProps} />,
      );

      await waitFor( () => {
        expect( mockRealm.objectForPrimaryKey ).toHaveBeenCalledWith(
          "Taxon",
          mockTaxon.id,
        );
      } );

      expect( fetchTaxonAndSave ).not.toHaveBeenCalled();
    } );

    it( "fetches taxon from API when not found in Realm", async () => {
      mockRealm.objectForPrimaryKey.mockReturnValue( null );
      fetchTaxonAndSave.mockResolvedValue( mockTaxon );

      useRoute.mockReturnValue( {
        params: {
          identTaxonId: mockTaxon.id,
          uuid: mockObservation.uuid,
        },
      } );

      renderComponent(
        <IdentificationSheets {...defaultProps} />,
      );

      await waitFor( () => {
        expect( fetchTaxonAndSave ).toHaveBeenCalledWith(
          mockTaxon.id,
          mockRealm,
        );
      } );
    } );
  } );

  describe( "identReducer", () => {
    const initialState = {
      showIdentBodySheet: false,
      newIdentification: null,
      showPotentialDisagreementSheet: false,
      showSuggestIdSheet: false,
    };

    it( "handles SET_NEW_IDENTIFICATION action", () => {
      const testTaxon = { id: 123, name: "Test Taxon" };
      const action = {
        type: "SET_NEW_IDENTIFICATION",
        taxon: testTaxon,
        body: "Test comment",
        vision: true,
      };
      const newState = identReducer( initialState, action );

      expect( newState.newIdentification ).toEqual( {
        taxon: testTaxon,
        body: "Test comment",
        vision: true,
      } );
    } );

    it( "handles SUBMIT_IDENTIFICATION action", () => {
      const stateWithData = {
        ...initialState,
        showPotentialDisagreementSheet: true,
        showSuggestIdSheet: true,
        newIdentification: { taxon: { id: 123 } },
      };
      const action = { type: "SUBMIT_IDENTIFICATION" };
      const newState = identReducer( stateWithData, action );

      expect( newState.showPotentialDisagreementSheet ).toBe( false );
      expect( newState.showSuggestIdSheet ).toBe( false );
      expect( newState.newIdentification ).toBeNull();
    } );
  } );

  describe( "deleted remote observation", () => {
    it( "shows WarningSheet when remoteObsWasDeleted is true", async () => {
      const confirmRemoteObsWasDeleted = jest.fn( );

      useRoute.mockReturnValue( {
        params: {
          uuid: mockObservation.uuid,
        },
      } );

      renderComponent(
        <IdentificationSheets
          {...defaultProps}
          confirmRemoteObsWasDeleted={confirmRemoteObsWasDeleted}
          remoteObsWasDeleted
        />,
      );

      expect(
        await screen.findByText( t( "OBSERVATION-WAS-DELETED" ) ),
      ).toBeVisible();
      expect(
        screen.getByText( t( "Sorry-this-observation-was-deleted" ) ),
      ).toBeVisible();
    } );
  } );

  // `identTaxonId` stays in the route params until a successful submit clears
  // them in onSettled, and the params -> state effect depends on
  // hasPotentialDisagreement, whose identity changes every time
  // observationShown is replaced. observationShown is replaced on every remote
  // refetch (focus, reconnect, any comment or ID mutation), so the effect
  // re-runs and re-dispatches CONFIRM_ID / SET_NEW_IDENTIFICATION long after
  // the user is done with the flow.
  describe( "when the observation is refetched while route params still hold a taxon", () => {
    const suggestPrompt = "Would-you-like-to-suggest-the-following-identification";

    beforeEach( () => {
      mockRealm.objectForPrimaryKey.mockReturnValue( { ...mockTaxon } );
      useRoute.mockReturnValue( {
        params: {
          identTaxonId: mockTaxon.id,
          uuid: mockObservation.uuid,
        },
      } );
    } );

    it( "does not reopen the suggest ID sheet the user already closed", async () => {
      const { rerender } = renderComponent(
        <IdentificationSheets {...defaultProps} observation={mockObservation} />,
      );

      expect( await screen.findByText( t( suggestPrompt ) ) ).toBeVisible();

      await userEvent.press( screen.getByLabelText( t( "Close" ) ) );
      expect( screen.queryByText( t( suggestPrompt ) ) ).toBeNull();

      // A remote refetch hands down a new observation object identity, exactly
      // as Observation.mapApiToRealm does on every settle
      renderComponent(
        <IdentificationSheets {...defaultProps} observation={{ ...mockObservation }} />,
        rerender,
      );

      await waitFor( () => {
        expect( screen.queryByText( t( suggestPrompt ) ) ).toBeNull();
      } );
    } );

    it( "keeps a comment the user already typed", async () => {
      const { rerender } = renderComponent(
        <IdentificationSheets {...defaultProps} observation={mockObservation} />,
      );

      expect( await screen.findByText( t( suggestPrompt ) ) ).toBeVisible();

      await userEvent.press( await screen.findByTestId( "SuggestID.commentButton" ) );
      await userEvent.type(
        await screen.findByTestId( "TextInputSheet.notes" ),
        "Looks like a juvenile",
      );
      await userEvent.press( screen.getByTestId( "TextInputSheet.confirm" ) );

      expect( await screen.findByText( "Looks like a juvenile" ) ).toBeVisible();

      renderComponent(
        <IdentificationSheets {...defaultProps} observation={{ ...mockObservation }} />,
        rerender,
      );

      await waitFor( () => {
        expect( screen.getByText( "Looks like a juvenile" ) ).toBeVisible();
      } );
    } );
  } );

  // The user's report: the ID submitted, the observation view updated, and the
  // sheet stayed up. This checks the submit path is self-consistent when a
  // refetch lands afterwards. The setParams assertion covers useRouteEvent
  // clearing the params on delivery, which is what makes the flow one-shot.
  describe( "after a successful submit", () => {
    const suggestPrompt = "Would-you-like-to-suggest-the-following-identification";

    it( "closes the sheet and leaves it closed when the observation refetches", async () => {
      // React Navigation merges SET_PARAMS into a NEW params object rather
      // than mutating the existing one, which is what lets useRouteEvent hand
      // the handler a stable snapshot. The mock has to behave the same way.
      let params = {
        identTaxonId: mockTaxon.id,
        identAt: 1,
        uuid: mockObservation.uuid,
      };
      const setParams = jest.fn( next => {
        params = { ...params, ...next };
      } );
      useNavigation.mockReturnValue( { setParams } );
      useRoute.mockImplementation( () => ( { params } ) );
      mockRealm.objectForPrimaryKey.mockReturnValue( { ...mockTaxon } );

      const { rerender } = renderComponent(
        <IdentificationSheets {...defaultProps} observation={mockObservation} />,
      );

      expect( await screen.findByText( t( suggestPrompt ) ) ).toBeVisible();

      await userEvent.press( screen.getByTestId( "SuggestIDSheet.cvSuggestionsButton" ) );

      expect( mockMutate ).toHaveBeenCalled();
      expect( setParams ).toHaveBeenCalledWith( {
        identAt: undefined,
        identTaxonId: undefined,
        identTaxonFromVision: undefined,
      } );
      expect( screen.queryByText( t( suggestPrompt ) ) ).toBeNull();

      // The refetch kicked off in onSuccess settles a moment later
      renderComponent(
        <IdentificationSheets {...defaultProps} observation={{ ...mockObservation }} />,
        rerender,
      );

      await waitFor( () => {
        expect( screen.queryByText( t( suggestPrompt ) ) ).toBeNull();
      } );
    } );
  } );

  // Fetching the taxon is async, so two navigations in quick succession can
  // resolve out of order. The stale one must not win.
  describe( "two identification navigations in quick succession", () => {
    it( "ignores an earlier taxon fetch that resolves after a later one", async () => {
      const taxonA = { ...mockTaxon, id: 111, preferred_common_name: "Alpha Bee" };
      const taxonB = { ...mockTaxon, id: 222, preferred_common_name: "Beta Bee" };

      let resolveA = ( ) => {};
      fetchTaxonAndSave.mockImplementation( id => {
        if ( id === 111 ) {
          return new Promise( res => {
            resolveA = ( ) => res( taxonA );
          } );
        }
        return Promise.resolve( taxonB );
      } );
      // force the async fetch path for both
      mockRealm.objectForPrimaryKey.mockReturnValue( null );

      // React Navigation merges SET_PARAMS into a NEW params object, and
      // useRouteEvent keys on that identity, so the mock has to do the same
      let params = { uuid: mockObservation.uuid, identTaxonId: 111, identAt: 1 };
      useNavigation.mockReturnValue( {
        setParams: jest.fn( next => {
          params = { ...params, ...next };
        } ),
      } );
      useRoute.mockImplementation( () => ( { params } ) );

      const { rerender } = renderComponent(
        <IdentificationSheets {...defaultProps} observation={mockObservation} />,
      );

      // Second navigation arrives while the first fetch is still pending
      params = { ...params, identTaxonId: 222, identAt: 2 };
      renderComponent(
        <IdentificationSheets {...defaultProps} observation={mockObservation} />,
        rerender,
      );

      expect( await screen.findByText( "Beta Bee" ) ).toBeVisible();

      // The stale fetch now resolves. Flush it and any resulting render so
      // the assertions below cannot pass simply by running too early.
      await act( async () => {
        resolveA();
      } );

      expect( screen.getByText( "Beta Bee" ) ).toBeVisible();
      expect( screen.queryByText( "Alpha Bee" ) ).toBeNull();
    } );
  } );
} );
