import { render, screen } from "@testing-library/react-native";
import { TaxonResult } from "components/SharedComponents";
import initI18next from "i18n/initI18next";
import React from "react";

const mockTaxon = {
  id: 1,
  name: "Aves",
  preferred_common_name: "Birds",
  rank: "family",
  rank_level: 60
};

jest.mock( "sharedHooks/useTaxon", () => ( {
  __esModule: true,
  default: () => mockTaxon
} ) );

describe( "TaxonResult", () => {
  beforeAll( async () => {
    await initI18next();
  } );

  it( "should render correctly", () => {
    render(
      <TaxonResult
        taxon={mockTaxon}
      />
    );

    expect( screen ).toMatchSnapshot();
  } );
} );
