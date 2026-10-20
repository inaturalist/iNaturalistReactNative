import { useRoute } from "@react-navigation/native";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
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
      identTaxon: null,
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

    it( "hides the SuggestIDSheet when showing the potential disagreement sheet", () => {
      const stateWithSuggestSheet = {
        ...initialState,
        showSuggestIdSheet: true,
      };
      const newState = identReducer(
        stateWithSuggestSheet,
        { type: "SHOW_POTENTIAL_DISAGREEMENT_SHEET" },
      );

      expect( newState.showPotentialDisagreementSheet ).toBe( true );
      expect( newState.showSuggestIdSheet ).toBe( false );
    } );

    it( "handles SUBMIT_IDENTIFICATION action", () => {
      const stateWithData = {
        ...initialState,
        showPotentialDisagreementSheet: true,
        showSuggestIdSheet: true,
        newIdentification: { taxon: { id: 123 } },
        identTaxon: { id: 123 },
      };
      const action = { type: "SUBMIT_IDENTIFICATION" };
      const newState = identReducer( stateWithData, action );

      expect( newState.showPotentialDisagreementSheet ).toBe( false );
      expect( newState.showSuggestIdSheet ).toBe( false );
      expect( newState.newIdentification ).toBeNull();
      expect( newState.identTaxon ).toBeNull();
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

  describe( "PotentialDisagreementSheet", () => {
    // An ID of the observation taxon's ancestor is a potential disagreement
    const ancestorTaxon = factory( "RemoteTaxon", {
      id: 745,
      ancestor_ids: [1, 745],
    } );
    const disagreementObservation = {
      uuid: mockObservation.uuid,
      prefers_community_taxon: null,
      taxon: {
        id: 999,
        ancestor_ids: [1, 745, 999],
      },
    };

    const renderWithDisagreement = ( ) => {
      mockRealm.objectForPrimaryKey.mockReturnValue( ancestorTaxon );
      useRoute.mockReturnValue( {
        params: {
          identTaxonId: ancestorTaxon.id,
          identTaxonFromVision: true,
          uuid: disagreementObservation.uuid,
        },
      } );

      renderComponent(
        <IdentificationSheets
          {...defaultProps}
          observation={disagreementObservation}
        />,
      );
    };

    it( "shows the potential disagreement sheet when the new ID is an ancestor", async () => {
      renderWithDisagreement( );

      expect( await screen.findByText( t( "POTENTIAL-DISAGREEMENT" ) ) ).toBeVisible();
      expect( screen.queryByText(
        t( "Would-you-like-to-suggest-the-following-identification" ),
      ) ).toBeNull();
    } );

    it( "adds a comment from the sheet and submits it with the identification", async () => {
      renderWithDisagreement( );

      const commentButton = await screen.findByTestId(
        "PotentialDisagreementSheet.commentButton",
      );
      expect( screen.getByText( t( "ADD-COMMENT" ) ) ).toBeVisible();
      fireEvent.press( commentButton );

      fireEvent.changeText(
        await screen.findByTestId( "TextInputSheet.notes" ),
        "I think this is as far as we can go",
      );
      fireEvent.press( screen.getByTestId( "TextInputSheet.confirm" ) );

      // The comment shows in the sheet and the button offers to edit it
      expect(
        await screen.findByText( "I think this is as far as we can go" ),
      ).toBeVisible();
      expect( screen.getByText( t( "EDIT-COMMENT" ) ) ).toBeVisible();

      fireEvent.press( screen.getByText( t( "SUBMIT" ) ) );

      expect( mockMutate ).toHaveBeenCalledWith( {
        identification: {
          observation_id: disagreementObservation.uuid,
          taxon_id: ancestorTaxon.id,
          // Editing the comment must not drop the fact that this ID came from vision
          vision: true,
          disagreement: false,
          body: "I think this is as far as we can go",
        },
      } );
    } );

    it( "keeps the pending identification when the comment sheet is closed", async () => {
      renderWithDisagreement( );

      fireEvent.press(
        await screen.findByTestId( "PotentialDisagreementSheet.commentButton" ),
      );
      await screen.findByTestId( "TextInputSheet.notes" );

      // Both sheets are mounted, but only the comment sheet on top is interactive
      const closeButtons = screen.getAllByLabelText( t( "Close" ) );
      expect( closeButtons ).toHaveLength( 2 );
      const enabledCloseButtons = closeButtons.filter(
        closeButton => !closeButton.props.accessibilityState?.disabled,
      );
      expect( enabledCloseButtons ).toHaveLength( 1 );

      fireEvent.press( enabledCloseButtons[0] );

      expect( screen.queryByTestId( "TextInputSheet.notes" ) ).toBeNull();
      expect( screen.getByText( t( "POTENTIAL-DISAGREEMENT" ) ) ).toBeVisible();

      fireEvent.press( screen.getByText( t( "SUBMIT" ) ) );

      expect( mockMutate ).toHaveBeenCalledWith( {
        identification: {
          observation_id: disagreementObservation.uuid,
          taxon_id: ancestorTaxon.id,
          vision: true,
          disagreement: false,
          body: undefined,
        },
      } );
    } );
  } );
} );
