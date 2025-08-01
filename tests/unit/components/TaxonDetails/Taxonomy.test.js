import { fireEvent, render, screen } from "@testing-library/react-native";
import Taxonomy from "components/TaxonDetails/Taxonomy.tsx";
import React from "react";
import factory from "tests/factory";

const mockUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => mockUser
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: jest.fn( ),
    useRoute: jest.fn( ( ) => ( { } ) )
  };
} );

const capitalizeFirstLetter = s => s.charAt( 0 ).toUpperCase( ) + s.slice( 1 );

const ancestors = [
  factory( "RemoteTaxon", {
    name: "Fungi",
    preferred_common_name: "Fungi Including Lichens",
    rank: "kingdom",
    rank_level: 80
  } ),
  factory( "RemoteTaxon", {
    name: "Agaricomycetes",
    preferred_common_name: "Mushrooms, Bracket Fungi, Puffballs, and Allies",
    rank: "class",
    rank_level: 60
  } )
];

const children = [factory( "RemoteTaxon", {
  name: "Amanitina",
  preferred_common_name: "Amanita Subg. Amanitina",
  rank_level: 15,
  rank: "subgenus"
} )
];

const currentTaxon = factory( "RemoteTaxon", {
  name: "Amanita",
  preferred_common_name: "Amanita Mushrooms",
  rank: "genus",
  rank_level: 20,
  ancestors,
  children
} );

describe( "Taxonomy", ( ) => {
  test( "renders current taxon", ( ) => {
    render( <Taxonomy taxon={currentTaxon} /> );

    const rankAndName = `${capitalizeFirstLetter( currentTaxon.rank )} ${currentTaxon.name}`;
    const commonName = currentTaxon.preferred_common_name;
    const currentTaxonRow = screen.getByTestId( `TaxonomyTaxon.${currentTaxon.id}` );

    expect( currentTaxonRow ).toHaveTextContent( `${commonName} (${rankAndName})` );
  } );

  test( "renders all ancestors", ( ) => {
    render( <Taxonomy taxon={currentTaxon} /> );

    currentTaxon.ancestors.forEach( ancestor => {
      const ancestorName = screen.getByText( ancestor.name );
      const ancestorCommonName = screen.getByText( ancestor.preferred_common_name );

      expect( ancestorName ).toBeVisible( );
      expect( ancestorCommonName ).toBeVisible( );
    } );
  } );

  test( "renders button to optionally show children", ( ) => {
    render( <Taxonomy taxon={currentTaxon} /> );

    const buttonText = screen.getByText( /VIEW CHILDREN TAXA/ );
    expect( buttonText ).toBeVisible( );

    // eslint-disable-next-line testing-library/no-node-access
    currentTaxon.children.forEach( child => {
      const childName = screen.queryByText( child.name );
      const childCommonName = screen.queryByText( child.preferred_common_name );

      expect( childName ).toBeFalsy( );
      expect( childCommonName ).toBeFalsy( );
    } );
  } );

  test( "shows children when button pressed", ( ) => {
    render( <Taxonomy taxon={currentTaxon} /> );

    const buttonText = screen.getByText( /VIEW CHILDREN TAXA/ );
    fireEvent.press( buttonText );

    // eslint-disable-next-line testing-library/no-node-access
    currentTaxon.children.forEach( child => {
      const childName = screen.getByText( child.name );
      const childCommonName = screen.getByText( child.preferred_common_name );

      expect( childName ).toBeVisible( );
      expect( childCommonName ).toBeVisible( );
    } );
  } );
} );
