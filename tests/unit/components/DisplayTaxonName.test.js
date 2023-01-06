import { render } from "@testing-library/react-native";
import DisplayTaxonName from "components/DisplayTaxonName";
import React from "react";

import factory from "../../factory";

const speciesTaxon = factory( "LocalTaxon", {
  name: "Chelonia mydas",
  preferred_common_name: "Green Sea Turtle",
  rank: "species",
  rank_level: 10
} );

const noCommonNameTaxon = factory( "LocalTaxon", {
  preferred_common_name: null,
  rank: "species",
  rank_level: 10
} );

const highRankTaxon = factory( "LocalTaxon", {
  preferred_common_name: null,
  rank_level: 27
} );

const subspeciesTaxon = factory( "LocalTaxon", {
  name: "Lupinus albifrons collinus",
  preferred_common_name: "Silver Lupine",
  rank: "variety",
  rank_level: 9
} );

describe( "when common name is first", () => {
  const user = { prefers_scientific_name_first: false };

  test( "renders correct taxon for species", () => {
    const { getByText } = render(
      <DisplayTaxonName item={{ taxon: speciesTaxon, user }} />
    );

    expect(
      getByText( `${speciesTaxon.preferred_common_name} (${speciesTaxon.name})` )
    ).toBeTruthy();
  } );

  test( "renders correct taxon w/o common name", () => {
    const { getByText } = render(
      <DisplayTaxonName item={{ taxon: noCommonNameTaxon, user }} />
    );

    expect( getByText( noCommonNameTaxon.name ) ).toBeTruthy();
  } );

  test( "renders correct taxon w/o common name and no species", () => {
    const { getByText } = render(
      <DisplayTaxonName item={{ taxon: highRankTaxon, user }} />
    );

    expect(
      getByText( `${highRankTaxon.rank} ${highRankTaxon.name}` )
    ).toBeTruthy();
  } );

  test( "renders correct taxon for a subspecies", () => {
    const { getByText } = render(
      <DisplayTaxonName item={{ taxon: highRankTaxon, user }} />
    );

    expect(
      getByText( `${highRankTaxon.rank} ${highRankTaxon.name}` )
    ).toBeTruthy();
  } );

  test( "renders correct taxon for species", () => {
    const { getByText } = render(
      <DisplayTaxonName item={{ taxon: subspeciesTaxon, user }} />
    );

    expect(
      getByText( "Silver Lupine (Lupinus albifrons var. collinus)" )
    ).toBeTruthy();
  } );
} );

describe( "when scientific name is first", () => {
  const user = { prefers_scientific_name_first: true };

  test( "renders correct taxon for species", () => {
    const { getByText } = render(
      <DisplayTaxonName item={{ taxon: speciesTaxon, user }} />
    );

    expect(
      getByText( `${speciesTaxon.name} (${speciesTaxon.preferred_common_name})` )
    ).toBeTruthy();
  } );

  test( "renders correct taxon w/o common name", () => {
    const { getByText } = render(
      <DisplayTaxonName item={{ taxon: noCommonNameTaxon, user }} />
    );

    expect( getByText( noCommonNameTaxon.name ) ).toBeTruthy();
  } );

  test( "renders correct taxon w/o common name and no species", () => {
    const { getByText } = render(
      <DisplayTaxonName item={{ taxon: highRankTaxon, user }} />
    );

    expect(
      getByText( `${highRankTaxon.rank} ${highRankTaxon.name}` )
    ).toBeTruthy();
  } );

  test( "renders correct taxon for species", () => {
    const { getByText } = render(
      <DisplayTaxonName item={{ taxon: subspeciesTaxon, user }} />
    );

    expect(
      getByText( "Lupinus albifrons var. collinus (Silver Lupine)" )
    ).toBeTruthy();
  } );
} );
