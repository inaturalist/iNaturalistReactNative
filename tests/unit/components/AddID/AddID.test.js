import { faker } from "@faker-js/faker";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { fireEvent, screen } from "@testing-library/react-native";
import AddID from "components/AddID/AddID";
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
  "components/SharedComponents/ViewWrapper",
  () => function MockViewWrapper( props ) {
    const MockName = "mock-view-no-footer";
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <MockName {...props} testID={MockName}>
        {props.children}
      </MockName>
    );
  }
);

const mockTaxon = factory( "RemoteTaxon", {
  name: faker.name.firstName( ),
  rank: "genus",
  rank_level: 27,
  preferred_common_name: faker.name.fullName( ),
  default_photo: {
    square_url: faker.image.imageUrl( )
  },
  ancestors: [{
    id: faker.datatype.number( ),
    preferred_common_name: faker.name.fullName( ),
    name: faker.name.fullName( ),
    rank: "class"
  }],
  wikipedia_summary: faker.lorem.paragraph( ),
  taxonPhotos: [{
    photo: factory( "RemotePhoto" )
  }],
  wikipedia_url: faker.internet.url( )
} );

const mockTaxaList = [
  mockTaxon,
  {
    ...mockTaxon,
    id: faker.datatype.number( )
  },
  {
    ...mockTaxon,
    id: faker.datatype.number( )
  }
];

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( {
    data: mockTaxaList
  } )
} ) );

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

describe( "AddID", () => {
  beforeAll( async () => {
    await initI18next();
  } );

  test( "should not have accessibility errors", () => {
    const addID = (
      <BottomSheetModalProvider>
        <INatPaperProvider>
          <AddID route={mockRoute} />
        </INatPaperProvider>
      </BottomSheetModalProvider>
    );
    expect( addID ).toBeAccessible();
  } );

  it( "should render inside mocked container", () => {
    renderComponent( <AddID route={mockRoute} /> );
    expect( screen.getByTestId( "mock-view-no-footer" ) ).toBeTruthy();
  } );

  it( "show taxon search results", async () => {
    inatjs.search.mockResolvedValue( makeResponse( mockTaxaList ) );
    renderComponent( <AddID route={mockRoute} /> );
    const input = screen.getByTestId( "SearchTaxon" );
    const taxon = mockTaxaList[0];
    fireEvent.changeText( input, "Some taxon" );
    expect( await screen.findByTestId( `Search.taxa.${taxon.id}` ) ).toBeTruthy();
  } );

  it( "calls callback with a taxon that can be saved to Realm", async () => {
    const mockCallback = jest.fn( ident => {
      global.realm.write( () => {
        global.realm.create( "Taxon", ident.taxon );
      } );
    } );
    renderComponent(
      <AddID
        route={{
          params: {
            onIDAdded: mockCallback
          }
        }}
      />
    );
    const input = screen.getByTestId( "SearchTaxon" );
    const taxon = mockTaxaList[0];

    fireEvent.changeText( input, "Some taxon" );

    expect( await screen.findByTestId( `Search.taxa.${taxon.id}` ) ).toBeTruthy();
    const labelText = t( "Add-this-ID" );
    const chooseButton = ( await screen.findAllByLabelText( labelText ) )[0];
    fireEvent.press( chooseButton );
    expect( mockCallback ).toHaveBeenCalled();
  } );
} );
