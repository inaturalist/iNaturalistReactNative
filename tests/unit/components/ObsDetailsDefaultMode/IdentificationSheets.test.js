import { useRoute } from "@react-navigation/native";
import { screen, waitFor } from "@testing-library/react-native";
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
      },
    } ) );
  } );

  const defaultProps = {
    agreeIdentification: null,
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
      comment: null,
      commentIsOptional: false,
      identBodySheetShown: false,
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

    it( "handles DISCARD_ID action", () => {
      const stateWithData = {
        ...initialState,
        showSuggestIdSheet: true,
        identTaxon: { id: 123 },
        newIdentification: { taxon: { id: 123 } },
      };
      const action = { type: "DISCARD_ID" };
      const newState = identReducer( stateWithData, action );

      expect( newState.showSuggestIdSheet ).toBe( false );
      expect( newState.identTaxon ).toBeNull();
      expect( newState.newIdentification ).toBeNull();
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
} );
