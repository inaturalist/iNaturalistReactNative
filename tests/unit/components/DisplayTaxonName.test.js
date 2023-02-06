import { render, screen } from "@testing-library/react-native";
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

const uncapitalizedTaxon = factory( "LocalTaxon", {
  name: "Acanthaster planci",
  preferred_common_name: "cRoWn-Of-ThOrNs blue sEa-StarS",
  rank: "species",
  rank_level: 10
} );

describe( "when common name is first", ( ) => {
  const user = { prefers_scientific_name_first: false };

  test( "renders correct taxon for species", ( ) => {
    render( <DisplayTaxonName item={{ taxon: speciesTaxon, user }} /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      `${speciesTaxon.preferred_common_name} ${speciesTaxon.name}`
    );
  } );

  test( "renders correct taxon w/o common name", ( ) => {
    render( <DisplayTaxonName item={{ taxon: noCommonNameTaxon, user }} /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      noCommonNameTaxon.name
    );
  } );

  test( "renders correct taxon w/o common name and no species", ( ) => {
    render( <DisplayTaxonName item={{ taxon: highRankTaxon, user }} /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      `${highRankTaxon.rank} ${highRankTaxon.name}`
    );
  } );

  test( "renders correct taxon for a subspecies", ( ) => {
    render( <DisplayTaxonName item={{ taxon: highRankTaxon, user }} /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      `${highRankTaxon.rank} ${highRankTaxon.name}`
    );
  } );

  test( "renders correct taxon for species", ( ) => {
    render( <DisplayTaxonName item={{ taxon: subspeciesTaxon, user }} /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      "Silver Lupine Lupinus albifrons var. collinus"
    );
  } );

  test( "renders correct taxon for improperly capitalized common name", ( ) => {
    render( <DisplayTaxonName item={{ taxon: uncapitalizedTaxon, user }} /> );
    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      "Crown-of-thorns Blue Sea-Stars Acanthaster planci"
    );
  } );

  test( "renders correct taxon for species in grid view", ( ) => {
    render(
      <DisplayTaxonName layout="grid" item={{ taxon: subspeciesTaxon, user }} />
    );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      "Silver Lupine Lupinusalbifrons var. collinus"
    );
  } );
} );

describe( "when scientific name is first", ( ) => {
  const user = { prefers_scientific_name_first: true };

  test( "renders correct taxon for species", ( ) => {
    render( <DisplayTaxonName item={{ taxon: speciesTaxon, user }} /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      `${speciesTaxon.name} ${speciesTaxon.preferred_common_name}`
    );
  } );

  test( "renders correct taxon w/o common name", ( ) => {
    render( <DisplayTaxonName item={{ taxon: noCommonNameTaxon, user }} /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      noCommonNameTaxon.name
    );
  } );

  test( "renders correct taxon w/o common name and no species", ( ) => {
    render( <DisplayTaxonName item={{ taxon: highRankTaxon, user }} /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      `${highRankTaxon.rank} ${highRankTaxon.name}`
    );
  } );

  test.only( "renders correct taxon for species", ( ) => {
    render( <DisplayTaxonName item={{ taxon: subspeciesTaxon, user }} /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      "Silver LupineLupinus albifrons var. collinus"
    );
  } );

  test( "renders correct taxon for species in grid view", ( ) => {
    render(
      <DisplayTaxonName layout="grid" item={{ taxon: subspeciesTaxon, user }} />
    );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      "Lupinus albifrons var. collinusSilver Lupine"
    );
  } );
} );
