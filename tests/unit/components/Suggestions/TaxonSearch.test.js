import { faker } from "@faker-js/faker";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { fireEvent, screen } from "@testing-library/react-native";
import TaxonSearch from "components/Suggestions/TaxonSearch";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import { ObsEditContext } from "providers/contexts";
import INatPaperProvider from "providers/INatPaperProvider";
import React from "react";

import factory, { makeResponse } from "../../../factory";
import { renderComponent } from "../../../helpers/render";
// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );
jest.mock( "providers/ObsEditProvider" );

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
  preferred_common_name: faker.name.fullName( ),
  default_photo: {
    square_url: faker.image.imageUrl( )
  }
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

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      goBack: jest.fn( ),
      setOptions: jest.fn( ),
      addListener: jest.fn( )
    } )
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

const renderTaxonSearch = ( ) => renderComponent(
  <ObsEditContext.Provider value={{
    updateObservationKeys: jest.fn( )
  }}
  >
    <TaxonSearch />
  </ObsEditContext.Provider>
);

describe( "TaxonSearch", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  test( "should not have accessibility errors", () => {
    const suggestions = (
      <BottomSheetModalProvider>
        <INatPaperProvider>
          <ObsEditContext.Provider value={{
            updateObservationKeys: jest.fn( )
          }}
          >
            <TaxonSearch />
          </ObsEditContext.Provider>
        </INatPaperProvider>
      </BottomSheetModalProvider>
    );
    expect( suggestions ).toBeAccessible( );
  } );

  it( "should render inside mocked container", ( ) => {
    renderTaxonSearch( );
    expect( screen.getByTestId( "mock-view-no-footer" ) ).toBeTruthy();
  } );

  it( "show taxon search results", async ( ) => {
    inatjs.search.mockResolvedValue( makeResponse( mockTaxaList ) );
    renderTaxonSearch( );
    const input = screen.getByTestId( "SearchTaxon" );
    const taxon = mockTaxaList[0];
    fireEvent.changeText( input, "Some taxon" );
    expect( await screen.findByTestId( `Search.taxa.${taxon.id}` ) ).toBeTruthy();
  } );
} );
