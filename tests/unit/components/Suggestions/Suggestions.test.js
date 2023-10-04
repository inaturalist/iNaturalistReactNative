import { faker } from "@faker-js/faker";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { fireEvent, screen } from "@testing-library/react-native";
import SuggestionsContainer from "components/Suggestions/SuggestionsContainer";
import initI18next from "i18n/initI18next";
import { t } from "i18next";
import inatjs from "inaturalistjs";
import { ObsEditContext } from "providers/contexts";
import INatPaperProvider from "providers/INatPaperProvider";
import React from "react";

import factory, { makeResponse } from "../../../factory";
import { renderComponent } from "../../../helpers/render";
// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );
jest.mock( "providers/ObsEditProvider" );

const mockMutate = jest.fn();
jest.mock( "sharedHooks/useAuthenticatedMutation", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    mutate: mockMutate
  } )
} ) );

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
  // rank: "genus",
  // rank_level: 27,
  preferred_common_name: faker.name.fullName( ),
  default_photo: {
    square_url: faker.image.imageUrl( )
  }
  // ancestors: [{
  //   id: faker.datatype.number( ),
  //   preferred_common_name: faker.name.fullName( ),
  //   name: faker.name.fullName( ),
  //   rank: "class"
  // }],
  // wikipedia_summary: faker.lorem.paragraph( ),
  // taxonPhotos: [{
  //   photo: factory( "RemotePhoto" )
  // }],
  // wikipedia_url: faker.internet.url( )
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

const mockRoute = {
  params: {
    observationUUID: faker.datatype.uuid( ),
    createRemoteIdentification: true
  }
};

const renderSuggestions = ( ) => renderComponent(
  <ObsEditContext.Provider value={{
    updateObservationKeys: jest.fn( )
  }}
  >
    <SuggestionsContainer route={mockRoute} />
  </ObsEditContext.Provider>
);

describe( "Suggestions", ( ) => {
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
            <SuggestionsContainer route={mockRoute} />
          </ObsEditContext.Provider>
        </INatPaperProvider>
      </BottomSheetModalProvider>
    );
    expect( suggestions ).toBeAccessible( );
  } );

  it( "should render inside mocked container", ( ) => {
    renderSuggestions( );
    expect( screen.getByTestId( "mock-view-no-footer" ) ).toBeTruthy();
  } );

  it( "show taxon search results", async ( ) => {
    inatjs.search.mockResolvedValue( makeResponse( mockTaxaList ) );
    renderSuggestions( );
    const input = screen.getByTestId( "SearchTaxon" );
    const taxon = mockTaxaList[0];
    fireEvent.changeText( input, "Some taxon" );
    expect( await screen.findByTestId( `Search.taxa.${taxon.id}` ) ).toBeTruthy();
  } );

  it( "shows loading indicator when taxon is selected", async () => {
    renderSuggestions( );
    const input = screen.getByTestId( "SearchTaxon" );
    const taxon = mockTaxaList[0];

    fireEvent.changeText( input, "Some taxon" );

    expect( await screen.findByTestId( `Search.taxa.${taxon.id}` ) ).toBeTruthy();
    const labelText = t( "Checkmark" );
    const chooseButton = ( await screen.findAllByLabelText( labelText ) )[0];
    fireEvent.press( chooseButton );
    await screen.findByTestId( "Suggestions.ActivityIndicator" );
  } );
} );
