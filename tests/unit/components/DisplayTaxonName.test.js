import { render, screen } from "@testing-library/react-native";
import { DisplayTaxonName } from "components/SharedComponents";
import React from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import factory from "tests/factory";
import faker from "tests/helpers/faker";

const capitalizeFirstLetter = s => s.charAt( 0 ).toUpperCase( ) + s.slice( 1 );

const speciesTaxon = factory( "LocalTaxon", {
  name: "Chelonia mydas",
  preferred_common_name: "Green Sea Turtle",
  rank: "species",
  rank_level: 10,
} );

const noCommonNameTaxon = factory( "LocalTaxon", {
  name: faker.person.firstName( ),
  preferred_common_name: null,
  rank: "species",
  rank_level: 10,
} );

const highRankTaxon = factory( "LocalTaxon", {
  name: faker.person.firstName( ),
  preferred_common_name: null,
  rank_level: 27,
  rank: "genus",
} );

const subspeciesTaxon = factory( "LocalTaxon", {
  name: "Lupinus albifrons collinus",
  preferred_common_name: "Silver Lupine",
  rank: "variety",
  rank_level: 9,
} );

const uncapitalizedTaxon = factory( "LocalTaxon", {
  name: "Acanthaster planci",
  preferred_common_name: "cRoWn-Of-ThOrNs blue sEa-StarS",
  rank: "species",
  rank_level: 10,
} );

const multipleLexiconTaxon = factory( "LocalTaxon", {
  name: "Haematopus bachmani",
  preferred_common_name: "Klippen-Austernfischer · Black Oystercatcher",
  rank: "species",
  rank_level: 10,
} );

describe( "DisplayTaxonName", ( ) => {
  describe( "when common name is first", ( ) => {
    test( "renders correct taxon for species", ( ) => {
      render( <DisplayTaxonName taxon={speciesTaxon} /> );

      expect(
        screen.getByTestId( `display-taxon-name.${speciesTaxon.id}` ),
      ).toHaveTextContent(
        `${speciesTaxon.preferred_common_name}${speciesTaxon.name}`,
      );
    } );

    test( "renders correct taxon w/o common name", ( ) => {
      render( <DisplayTaxonName taxon={noCommonNameTaxon} /> );

      expect(
        screen.getByTestId( `display-taxon-name.${noCommonNameTaxon.id}` ),
      ).toHaveTextContent( noCommonNameTaxon.name );
    } );

    test( "renders correct taxon w/o common name and no species", ( ) => {
      render( <DisplayTaxonName taxon={highRankTaxon} /> );

      expect(
        screen.getByTestId( `display-taxon-name.${highRankTaxon.id}` ),
      ).toHaveTextContent(
        `${capitalizeFirstLetter( highRankTaxon.rank )} ${highRankTaxon.name}`,
      );
    } );

    test( "renders correct taxon for a subfamily", ( ) => {
      render( <DisplayTaxonName taxon={highRankTaxon} /> );

      expect(
        screen.getByTestId( `display-taxon-name.${highRankTaxon.id}` ),
      ).toHaveTextContent(
        `${capitalizeFirstLetter( highRankTaxon.rank )} ${highRankTaxon.name}`,
      );
    } );

    test( "renders correct taxon for subspecies", ( ) => {
      render( <DisplayTaxonName taxon={subspeciesTaxon} layout="horizontal" /> );

      expect(
        screen.getByTestId( `display-taxon-name.${subspeciesTaxon.id}` ),
      ).toHaveTextContent( "Silver Lupine Lupinus albifrons var. collinus" );
    } );

    test( "renders correct taxon for improperly capitalized common name", ( ) => {
      render( <DisplayTaxonName taxon={uncapitalizedTaxon} layout="horizontal" /> );
      expect(
        screen.getByTestId( `display-taxon-name.${uncapitalizedTaxon.id}` ),
      ).toHaveTextContent( "Crown-of-thorns Blue Sea-Stars Acanthaster planci" );
    } );

    test( "renders correct taxon for species in grid view", ( ) => {
      render( <DisplayTaxonName layout="vertical" taxon={subspeciesTaxon} /> );
      // Grid view should not have a space between text
      expect(
        screen.getByTestId( `display-taxon-name.${subspeciesTaxon.id}` ),
      ).toHaveTextContent( "Silver LupineLupinus albifrons var. collinus" );
    } );

    test( "displays correct capitalization for multiple lexicons", ( ) => {
      render( <DisplayTaxonName taxon={multipleLexiconTaxon} /> );

      expect(
        screen.getByTestId( `display-taxon-name.${multipleLexiconTaxon.id}` ),
      ).toHaveTextContent(
        "Klippen-Austernfischer · Black Oystercatcher",
        { exact: false },
      );
    } );
  } );

  describe( "when scientific name is first", ( ) => {
    test( "renders correct taxon for species", ( ) => {
      render( <DisplayTaxonName taxon={speciesTaxon} scientificNameFirst layout="horizontal" /> );

      expect(
        screen.getByTestId( `display-taxon-name.${speciesTaxon.id}` ),
      ).toHaveTextContent(
        `${speciesTaxon.name} ${speciesTaxon.preferred_common_name}`,
      );
    } );

    test( "renders correct taxon w/o common name", ( ) => {
      render( <DisplayTaxonName taxon={noCommonNameTaxon} scientificNameFirst /> );

      expect(
        screen.getByTestId( `display-taxon-name.${noCommonNameTaxon.id}` ),
      ).toHaveTextContent( noCommonNameTaxon.name );
    } );

    test( "renders correct taxon w/o common name and no species", ( ) => {
      render( <DisplayTaxonName taxon={highRankTaxon} scientificNameFirst /> );

      expect(
        screen.getByTestId( `display-taxon-name.${highRankTaxon.id}` ),
      ).toHaveTextContent(
        `${capitalizeFirstLetter( highRankTaxon.rank )} ${highRankTaxon.name}`,
      );
    } );

    test( "renders correct taxon for species", ( ) => {
      render(
        <DisplayTaxonName taxon={subspeciesTaxon} scientificNameFirst layout="horizontal" />,
      );

      expect(
        screen.getByTestId( `display-taxon-name.${subspeciesTaxon.id}` ),
      ).toHaveTextContent( "Lupinus albifrons var. collinus Silver Lupine" );
    } );

    test( "renders correct taxon for species in grid view", ( ) => {
      render(
        <DisplayTaxonName
          layout="vertical"
          taxon={subspeciesTaxon}
          scientificNameFirst
        />,
      );

      // Grid view should not have a space between text
      expect(
        screen.getByTestId( `display-taxon-name.${subspeciesTaxon.id}` ),
      ).toHaveTextContent( "Lupinus albifrons var. collinusSilver Lupine" );
    } );
  } );

  describe( "when only scientific name", ( ) => {
    test( "renders correct taxon for species", ( ) => {
      render(
        <DisplayTaxonName
          taxon={speciesTaxon}
          scientificNameFirst
          layout="horizontal"
          prefersCommonNames={false}
        />,
      );

      expect(
        screen.getByTestId( `display-taxon-name.${speciesTaxon.id}` ),
      ).toHaveTextContent( speciesTaxon.name );
    } );

    test( "renders correct taxon w/o common name", ( ) => {
      render(
        <DisplayTaxonName
          taxon={noCommonNameTaxon}
          scientificNameFirst
          prefersCommonNames={false}
        />,
      );

      expect(
        screen.getByTestId( `display-taxon-name.${noCommonNameTaxon.id}` ),
      ).toHaveTextContent( noCommonNameTaxon.name );
    } );

    test( "renders correct taxon w/o common name and no species", ( ) => {
      render(
        <DisplayTaxonName
          taxon={highRankTaxon}
          scientificNameFirst
          prefersCommonNames={false}
        />,
      );

      expect(
        screen.getByTestId( `display-taxon-name.${highRankTaxon.id}` ),
      ).toHaveTextContent(
        `${capitalizeFirstLetter( highRankTaxon.rank )} ${highRankTaxon.name}`,
      );
    } );

    test( "renders correct taxon for species", ( ) => {
      render(
        <DisplayTaxonName
          taxon={subspeciesTaxon}
          scientificNameFirst
          layout="horizontal"
          prefersCommonNames={false}
        />,
      );

      expect(
        screen.getByTestId( `display-taxon-name.${subspeciesTaxon.id}` ),
      ).toHaveTextContent( "Lupinus albifrons var. collinus" );
    } );

    test( "renders correct taxon for species in grid view", ( ) => {
      render(
        <DisplayTaxonName
          layout="vertical"
          taxon={subspeciesTaxon}
          scientificNameFirst
          prefersCommonNames={false}
        />,
      );

      expect(
        screen.getByTestId( `display-taxon-name.${subspeciesTaxon.id}` ),
      ).toHaveTextContent( "Lupinus albifrons var. collinus" );
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
            rank_level: 20,
          },
          "modified",
        );
      }, "create taxon, DisplayTaxonName test" );
      render( <DisplayTaxonName taxon={taxon} /> );
      expect( screen.getByText( /Genus/ ) ).toBeTruthy( );
    } );
  } );

  describe( "when taxon is undefined", ( ) => {
    it( "it displays fallback text", ( ) => {
      let taxon;
      render( <DisplayTaxonName taxon={taxon} /> );
      expect( screen.getByText( /Unknown/ ) ).toBeTruthy( );
    } );
  } );

  describe( "when displayed as plain text within a Trans component", ( ) => {
    it( "it displays common name followed by scientific name", async ( ) => {
      render( <DisplayTaxonName taxon={subspeciesTaxon} removeStyling layout="horizontal" /> );
      expect(
        screen.getByTestId( `display-taxon-name-no-styling.${subspeciesTaxon.id}` ),
      ).toHaveTextContent( "Silver Lupine (Lupinus albifrons var. collinus)" );
    } );

    it( "it displays scientific name followed by common name", async ( ) => {
      render(
        <DisplayTaxonName
          taxon={subspeciesTaxon}
          removeStyling
          layout="horizontal"
          scientificNameFirst
        />,
      );
      expect(
        screen.getByTestId( `display-taxon-name-no-styling.${subspeciesTaxon.id}` ),
      ).toHaveTextContent( "Lupinus albifrons var. collinus (Silver Lupine)" );
    } );

    it( "it displays scientific name only", async ( ) => {
      render(
        <DisplayTaxonName
          taxon={subspeciesTaxon}
          removeStyling
          layout="horizontal"
          scientificNameFirst
          prefersCommonNames={false}
        />,
      );
      expect(
        screen.getByTestId( `display-taxon-name-no-styling.${subspeciesTaxon.id}` ),
      ).toHaveTextContent( "Lupinus albifrons var. collinus" );
    } );
  } );
} );
