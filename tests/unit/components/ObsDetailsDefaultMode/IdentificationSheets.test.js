import { useRoute } from "@react-navigation/native";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import IdentificationSheets from "components/ObsDetailsDefaultMode/IdentificationSheets";
import initI18next from "i18n/initI18next";
import { t } from "i18next";
import React from "react";
import { Alert } from "react-native";
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
const mockLoadActivityItem = jest.fn();
const mockHandleCommentMutationSuccess = jest.fn();
const mockHandleIdentificationMutationSuccess = jest.fn();
const mockHideAddCommentSheet = jest.fn();
const mockCloseAgreeWithIdSheet = jest.fn();

describe( "IdentificationSheets", () => {
  beforeAll( async () => {
    await initI18next();
    jest.spyOn( Alert, "alert" );
  } );

  beforeEach( () => {
    jest.clearAllMocks();

    mockRealm.objectForPrimaryKey.mockReturnValue( null );

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
    closeAgreeWithIdSheet: mockCloseAgreeWithIdSheet,
    handleCommentMutationSuccess: mockHandleCommentMutationSuccess,
    handleIdentificationMutationSuccess: mockHandleIdentificationMutationSuccess,
    hideAddCommentSheet: mockHideAddCommentSheet,
    loadActivityItem: mockLoadActivityItem,
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

    it( "includes vision flag when identTaxonFromVision is true", async () => {
      useRoute.mockReturnValue( {
        params: {
          identTaxonId: mockTaxon.id,
          identTaxonFromVision: true,
          uuid: mockObservation.uuid,
        },
      } );

      fetchTaxonAndSave.mockResolvedValue( mockTaxon );

      renderComponent(
        <IdentificationSheets {...defaultProps} />,
      );

      const suggestButton = await screen.findByTestId( "SuggestIDSheet.cvSuggestionsButton" );
      fireEvent.press( suggestButton );

      await waitFor( () => {
        expect( mockMutate ).toHaveBeenCalledWith( {
          identification: {
            observation_id: mockObservation.uuid,
            taxon_id: mockTaxon.id,
            vision: true,
            disagreement: undefined,
            body: undefined,
          },
        } );
      } );
    } );
  } );
} );
