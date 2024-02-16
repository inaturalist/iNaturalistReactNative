import faker from "tests/helpers/faker";
import { render, screen } from "@testing-library/react-native";
import { DisplayTaxonName } from "components/SharedComponents";
import initI18next from "i18n/initI18next";
import React from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import factory from "tests/factory";

const capitalizeFirstLetter = s => s.charAt( 0 ).toUpperCase( ) + s.slice( 1 );

const speciesTaxon = factory( "LocalTaxon", {
  name: "Chelonia mydas",
  preferred_common_name: "Green Sea Turtle",
  rank: "species",
  rank_level: 10
} );

const noCommonNameTaxon = factory( "LocalTaxon", {
  name: faker.person.firstName( ),
  preferred_common_name: null,
  rank: "species",
  rank_level: 10
} );

const highRankTaxon = factory( "LocalTaxon", {
  name: faker.person.firstName( ),
  preferred_common_name: null,
  rank_level: 27,
  rank: "genus"
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

describe( "DisplayTaxonName", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  describe( "when common name is first", ( ) => {
    test( "renders correct taxon for species", ( ) => {
      render( <DisplayTaxonName taxon={speciesTaxon} /> );

      expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
        `${speciesTaxon.preferred_common_name}${speciesTaxon.name}`
      );
    } );

    test( "renders correct taxon w/o common name", ( ) => {
      render( <DisplayTaxonName taxon={noCommonNameTaxon} /> );

      expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
        noCommonNameTaxon.name
      );
    } );

    test( "renders correct taxon w/o common name and no species", ( ) => {
      render( <DisplayTaxonName taxon={highRankTaxon} /> );

      expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
        `${capitalizeFirstLetter( highRankTaxon.rank )} ${highRankTaxon.name}`
      );
    } );

    test( "renders correct taxon for a subfamily", ( ) => {
      render( <DisplayTaxonName taxon={highRankTaxon} /> );

      expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
        `${capitalizeFirstLetter( highRankTaxon.rank )} ${highRankTaxon.name}`
      );
    } );

    test( "renders correct taxon for subspecies", ( ) => {
      render( <DisplayTaxonName taxon={subspeciesTaxon} layout="horizontal" /> );

      expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
        "Silver Lupine Lupinus albifrons var. collinus"
      );
    } );

    test( "renders correct taxon for improperly capitalized common name", ( ) => {
      render( <DisplayTaxonName taxon={uncapitalizedTaxon} layout="horizontal" /> );
      expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
        "Crown-of-thorns Blue Sea-Stars Acanthaster planci"
      );
    } );

    test( "renders correct taxon for species in grid view", ( ) => {
      render( <DisplayTaxonName layout="vertical" taxon={subspeciesTaxon} /> );
      // Grid view should not have a space between text
      expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
        "Silver LupineLupinus albifrons var. collinus"
      );
    } );
  } );

  describe( "when scientific name is first", ( ) => {
    test( "renders correct taxon for species", ( ) => {
      render( <DisplayTaxonName taxon={speciesTaxon} scientificNameFirst layout="horizontal" /> );

      expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
        `${speciesTaxon.name} ${speciesTaxon.preferred_common_name}`
      );
    } );

    test( "renders correct taxon w/o common name", ( ) => {
      render( <DisplayTaxonName taxon={noCommonNameTaxon} scientificNameFirst /> );

      expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
        noCommonNameTaxon.name
      );
    } );

    test( "renders correct taxon w/o common name and no species", ( ) => {
      render( <DisplayTaxonName taxon={highRankTaxon} scientificNameFirst /> );

      expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
        `${capitalizeFirstLetter( highRankTaxon.rank )} ${highRankTaxon.name}`
      );
    } );

    test( "renders correct taxon for species", ( ) => {
      render(
        <DisplayTaxonName taxon={subspeciesTaxon} scientificNameFirst layout="horizontal" />
      );

      expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
        "Lupinus albifrons var. collinus Silver Lupine"
      );
    } );

    test( "renders correct taxon for species in grid view", ( ) => {
      render(
        <DisplayTaxonName
          layout="vertical"
          taxon={subspeciesTaxon}
          scientificNameFirst
        />
      );

      // Grid view should not have a space between text
      expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
        "Lupinus albifrons var. collinusSilver Lupine"
      );
    } );
  } );

  describe( "when taxon is a Realm object", ( ) => {
    it( "fills in a missing genus rank from the rank_level", ( ) => {
      let taxon;
      safeRealmWrite( global.realm, ( ) => {
        taxon = global.realm.create(
          "Taxon",
          {
            id: faker.number.int( ),
            name: faker.person.firstName( ),
            rank_level: 20
          },
          "modified"
        );
      }, "create taxon, DisplayTaxonName test" );
      render( <DisplayTaxonName taxon={taxon} /> );
      expect( screen.getByText( /Genus/ ) ).toBeTruthy( );
    } );
  } );
} );
