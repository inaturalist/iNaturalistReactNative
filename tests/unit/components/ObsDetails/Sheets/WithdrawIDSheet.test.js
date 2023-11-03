import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import WithdrawIDSheet from "components/ObsDetails/Sheets/WithdrawIDSheet";
import initI18next from "i18n/initI18next";
import { t } from "i18next";
import React from "react";

import factory from "../../../../factory";
import { renderComponent } from "../../../../helpers/render";

const mockTaxon = factory( "RemoteTaxon", {
  name: "Plantae",
  iconic_taxon_name: "Plantae"
} );

const mockUser = factory( "LocalUser", {
  id: 0,
  login: faker.internet.userName( ),
  iconUrl: faker.image.imageUrl( )
} );

jest.mock( "../../../../../src/components/LoginSignUp/AuthenticationService", ( ) => ( {
  getUserId: ( ) => mockUser.id,
  isCurrentUser: ( ) => true
} ) );

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => mockUser
} ) );

jest.mock( "components/SharedComponents/DisplayTaxonName" );

// TODO if/when we test mutation behavior, the mutation will need to be mocked
// so it actually does something, or we need to take a different approach
const mockMutate = jest.fn();
jest.mock( "sharedHooks/useAuthenticatedMutation", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    mutate: mockMutate
  } )
} ) );

const mockHandleClose = jest.fn();

describe( "WithdrawIDSheet", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "renders sheet correctly", async ( ) => {
    renderComponent(
      <WithdrawIDSheet
        handleClose={mockHandleClose}
        withdrawOrRestoreIdentification={mockMutate}
        taxon={mockTaxon}
      />
    );

    expect( await screen.findByText( t( "WITHDRAW-ID?" ) ) ).toBeTruthy( );
    expect( screen.getByRole(
      "button",
      { name: t( "WITHDRAW-ID" ), disabled: false }
    ) ).toBeTruthy( );
    expect( screen.getByRole(
      "button",
      { name: t( "CANCEL" ), disabled: false }
    ) ).toBeTruthy( );
  } );
} );
