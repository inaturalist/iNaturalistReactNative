import { render } from "@testing-library/react-native";
import DisplayTaxonName from "components/DisplayTaxonName";
import React from "react";

test( "when common name is first", () => {
  test( "renders correct taxon for species", () => {
    const taxon = {
      id: 449003,
      name: "foo",
      preferred_common_name: "bar",
      rank: "species",
      rank_level: 10
    };

    const { getByText } = render(
      <DisplayTaxonName
        item={{ taxon, user: { prefers_scientific_name_first: false } }}
      />
    );

    expect( getByText( "bar (foo)" ) ).toBeTruthy();
  } );
} );
