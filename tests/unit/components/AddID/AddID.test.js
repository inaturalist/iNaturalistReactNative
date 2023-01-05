import { fireEvent, waitFor } from "@testing-library/react-native";
import AddID from "components/ObsEdit/AddID";
import inatjs from "inaturalistjs";
import React from "react";

import factory, { makeResponse } from "../../../factory";
import { renderComponent } from "../../../helpers/render";
// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );

// this resolves a test failure with the Animated library:
// Animated: `useNativeDriver` is not supported because the native animated module is missing.
jest.useFakeTimers( );

const mockTaxaList = [
  factory( "RemoteTaxon" ),
  factory( "RemoteTaxon" ),
  factory( "RemoteTaxon" )
];

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockTaxaList
  } )
} ) );

jest.mock( "react-native-vector-icons/MaterialIcons", ( ) => {
  const InnerReact = require( "react" );
  class MaterialIcons extends InnerReact.Component {
    static getImageSourceSync( _thing, _number, _color ) {
      return { uri: "foo" };
    }

    render( ) {
      return InnerReact.createElement( "MaterialIcons", this.props, this.props.children );
    }
  }
  return MaterialIcons;
} );

const mockRoute = { params: {} };

describe( "AddID", ( ) => {
  test( "should not have accessibility errors", ( ) => {
    const addID = <AddID route={mockRoute} />;

    expect( addID ).toBeAccessible( );
  } );

  test( "should render taxon search results", async ( ) => {
    inatjs.search.mockResolvedValue( makeResponse( mockTaxaList ) );
    const { getByTestId } = renderComponent( <AddID route={mockRoute} /> );

    const input = getByTestId( "SearchTaxon" );
    const taxon = mockTaxaList[0];
    await waitFor( () => {
      fireEvent.changeText( input, "Some taxon" );
      expect( getByTestId( `Search.taxa.${taxon.id}` ) ).toBeTruthy( );
    } );

    expect(
      getByTestId( `Search.taxa.${taxon.id}.photo` ).props.source
    ).toStrictEqual( { uri: taxon.default_photo.square_url } );
  } );
} );
