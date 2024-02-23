import { render, screen } from "@testing-library/react-native";
import { TaxonResult } from "components/SharedComponents";
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
  it( "should render correctly", () => {
    render(
      <TaxonResult
        taxon={mockTaxon}
      />
    );

    expect( screen ).toMatchSnapshot();
  } );
} );
