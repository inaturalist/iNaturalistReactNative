import { screen } from "@testing-library/react-native";
import WithdrawIDSheet from "components/ObsDetails/Sheets/WithdrawIDSheet";
import { t } from "i18next";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockTaxon = factory( "RemoteTaxon", {
  name: "Plantae",
  iconic_taxon_name: "Plantae",
} );

const mockMutate = jest.fn();

const mockHandleClose = jest.fn();

describe( "WithdrawIDSheet", () => {
  it( "renders sheet correctly", async ( ) => {
    renderComponent(
      <WithdrawIDSheet
        onPressClose={mockHandleClose}
        withdrawOrRestoreIdentification={mockMutate}
        taxon={mockTaxon}
      />,
    );

    expect( await screen.findByText( t( "WITHDRAW-ID-QUESTION" ) ) ).toBeTruthy( );
    expect( screen.getByRole(
      "button",
      { name: t( "WITHDRAW-ID" ), disabled: false },
    ) ).toBeTruthy( );
    expect( screen.getByRole(
      "button",
      { name: t( "CANCEL" ), disabled: false },
    ) ).toBeTruthy( );
  } );
} );
