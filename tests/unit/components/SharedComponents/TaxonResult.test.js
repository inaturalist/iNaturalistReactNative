import { render, screen } from "@testing-library/react-native";
import { TaxonResult } from "components/SharedComponents";
import React from "react";

const mockTaxon = {
  id: 1,
  name: "Aves",
  preferred_common_name: "Birds",
  rank: "family",
  rank_level: 60,
};

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: () => undefined,
} ) );

jest.mock( "sharedHooks/useTaxon", () => ( {
  __esModule: true,
  default: () => ( { taxon: mockTaxon } ),
} ) );

describe( "TaxonResult", () => {
  it( "should render correctly", () => {
    render(
      <TaxonResult
        accessibilityLabel="this is the taxon"
        taxon={mockTaxon}
      />,
    );

    expect( screen ).toMatchSnapshot();
  } );
} );
