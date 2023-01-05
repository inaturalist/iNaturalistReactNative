import { render } from "@testing-library/react-native";
import DisplayTaxonName from "components/DisplayTaxonName";
import React from "react";

describe( "when common name is first", () => {
  const user = { prefers_scientific_name_first: false };

  test( "renders correct taxon for species", () => {
    const taxon = {
      name: "Chelonia mydas",
      preferred_common_name: "Green Sea Turtle",
      rank: "species",
      rank_level: 10
    };

    const { getByText } = render( <DisplayTaxonName item={{ taxon, user }} /> );

    expect( getByText( "Green Sea Turtle (Chelonia mydas)" ) ).toBeTruthy();
  } );

  test( "renders correct taxon w/o common name", () => {
    const taxon = {
      name: "Hogna hawaiiensis",
      preferred_common_name: null,
      rank: "species",
      rank_level: 10
    };

    const { getByText } = render( <DisplayTaxonName item={{ taxon, user }} /> );

    expect( getByText( "Hogna hawaiiensis" ) ).toBeTruthy();
  } );

  test( "renders correct taxon w/o common name and no species", () => {
    const taxon = {
      name: "Orsillinae",
      preferred_common_name: null,
      rank: "subfamily",
      rank_level: 27
    };

    const { getByText } = render( <DisplayTaxonName item={{ taxon, user }} /> );

    expect( getByText( "subfamily Orsillinae" ) ).toBeTruthy();
  } );
} );

describe( "when scientific name is first", () => {
  const user = { prefers_scientific_name_first: true };

  test( "renders correct taxon for species", () => {
    const taxon = {
      name: "Chelonia mydas",
      preferred_common_name: "Green Sea Turtle",
      rank: "species",
      rank_level: 10
    };

    const { getByText } = render( <DisplayTaxonName item={{ taxon, user }} /> );

    expect( getByText( "Chelonia mydas (Green Sea Turtle)" ) ).toBeTruthy();
  } );

  test( "renders correct taxon w/o common name", () => {
    const taxon = {
      name: "Hogna hawaiiensis",
      preferred_common_name: null,
      rank: "species",
      rank_level: 10
    };

    const { getByText } = render( <DisplayTaxonName item={{ taxon, user }} /> );

    expect( getByText( "Hogna hawaiiensis" ) ).toBeTruthy();
  } );

  test( "renders correct taxon w/o common name and no species", () => {
    const taxon = {
      name: "Orsillinae",
      preferred_common_name: null,
      rank: "subfamily",
      rank_level: 27
    };

    const { getByText } = render( <DisplayTaxonName item={{ taxon, user }} /> );

    expect( getByText( "subfamily Orsillinae" ) ).toBeTruthy();
  } );
} );
