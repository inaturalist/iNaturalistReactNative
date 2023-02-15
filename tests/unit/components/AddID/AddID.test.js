import { fireEvent, screen } from "@testing-library/react-native";
import AddID from "components/ObsEdit/AddID";
import initI18next from "i18n/initI18next";
import { t } from "i18next";
import inatjs from "inaturalistjs";
import INatPaperProvider from "providers/INatPaperProvider";
import React from "react";

import factory, { makeResponse } from "../../../factory";
import { renderComponent } from "../../../helpers/render";
// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );

jest.mock(
  "components/SharedComponents/ViewNoFooter",
  () => function MockViewNoFooter( props ) {
    const MockName = "mock-view-no-footer";
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MockName {...props} testID={MockName}>{props.children}</MockName>;
  }
);

jest.mock(
  "components/SharedComponents/BottomSheetStandardBackdrop",
  () => function MockBottomSheetStandardBackdrop( props ) {
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
      // I have disabled the eslint rule here because it is about a mock and not the test
      // eslint-disable-next-line testing-library/no-node-access
      return InnerReact.createElement( "MaterialIcons", this.props, this.props.children );
    }
  }
  return MaterialIcons;
} );

jest.mock( "@gorhom/bottom-sheet", () => {
  const actualBottomSheet = jest.requireActual( "@gorhom/bottom-sheet" );
  return {
    ...actualBottomSheet
  };
} );

// react-native-paper's TextInput does a bunch of async stuff that's hard to
// control in a test, so we're just mocking it here.
jest.mock( "react-native-paper", () => {
  const RealModule = jest.requireActual( "react-native-paper" );
  const MockTextInput = props => {
    const MockName = "mock-text-input";
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MockName {...props}>{props.children}</MockName>;
  };
  MockTextInput.Icon = RealModule.TextInput.Icon;
  const MockedModule = {
    ...RealModule,
    // eslint-disable-next-line react/jsx-props-no-spreading
    // TextInput: props => <View {...props}>{props.children}</View>
    TextInput: MockTextInput
  };
  return MockedModule;
} );

const mockRoute = { params: {} };

describe( "AddID", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  test( "should not have accessibility errors", ( ) => {
    const addID = (
      <INatPaperProvider>
        <AddID route={mockRoute} />
      </INatPaperProvider>
    );
    expect( addID ).toBeAccessible( );
  } );

  it( "should render inside mocked container", ( ) => {
    renderComponent( <AddID route={mockRoute} /> );
    expect( screen.getByTestId( "mock-view-no-footer" ) ).toBeTruthy( );
  } );

  it( "show taxon search results", async ( ) => {
    inatjs.search.mockResolvedValue( makeResponse( mockTaxaList ) );
    renderComponent( <AddID route={mockRoute} /> );
    const input = screen.getByTestId( "SearchTaxon" );
    const taxon = mockTaxaList[0];
    fireEvent.changeText( input, "Some taxon" );
    expect( await screen.findByTestId( `Search.taxa.${taxon.id}` ) ).toBeTruthy( );
    expect(
      screen.getByTestId( `Search.taxa.${taxon.id}.photo` ).props.source
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
