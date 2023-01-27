import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import AddID from "components/ObsEdit/AddID";
import { t } from "i18next";
import inatjs from "inaturalistjs";
import React from "react";

import factory, { makeResponse } from "../../../factory";
import { renderComponent } from "../../../helpers/render";
// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );

// this resolves a test failure with the Animated library:
// Animated: `useNativeDriver` is not supported because the native animated module is missing.
jest.useFakeTimers( );

jest.mock(
  "components/SharedComponents/ViewNoFooter",
  () => function MockContainer( props ) {
    const MockName = "mock-view-no-footer";
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MockName {...props} testID={MockName}>{props.children}</MockName>;
  }
);

jest.mock(
  "components/SharedComponents/BottomSheetStandardBackdrop",
  () => function MockContainer( props ) {
    const MockName = "mock-bottom-sheet-standard-backdrop";
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MockName {...props} testID={MockName}>{props.children}</MockName>;
  }
);

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
  // Does currently not pass because IconButton does not pass down a11y props
  // test( "should not have accessibility errors", ( ) => {
  //   const addID = <AddID route={mockRoute} />;

  //   expect( addID ).toBeAccessible( );
  // } );

  it( "show taxon search results", async ( ) => {
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

  it( "calls callback with a taxon that can be saved to Realm", async ( ) => {
    const mockCallback = jest.fn( ident => {
      global.realm.write( ( ) => {
        global.realm.create( "Taxon", ident.taxon );
      } );
    } );
    renderComponent( (
      <AddID
        route={{
          params: {
            onIDAdded: mockCallback
          }
        }}
      />
    ) );
    const input = screen.getByTestId( "SearchTaxon" );
    const taxon = mockTaxaList[0];

    fireEvent.changeText( input, "Some taxon" );

    expect( await screen.findByTestId( `Search.taxa.${taxon.id}` ) ).toBeTruthy( );
    const labelText = t( "Add-this-ID" );
    const chooseButton = ( await screen.findAllByLabelText( labelText ) )[0];
    fireEvent.press( chooseButton );
    expect( mockCallback ).toHaveBeenCalled( );
  } );
} );
