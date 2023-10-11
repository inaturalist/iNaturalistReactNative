import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import SuggestionsContainer from "components/Suggestions/SuggestionsContainer";
import initI18next from "i18n/initI18next";
import { ObsEditContext } from "providers/contexts";
import React from "react";

import factory from "../../../factory";
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
  "components/SharedComponents/ScrollViewWrapper",
  () => function MockScrollViewWrapper( props ) {
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

const mockSuggestionsList = [{
  combined_score: 90.34,
  taxon: {
    ...mockTaxon,
    id: faker.datatype.number( )
  }
}, {
  combined_score: 30.32,
  taxon: {
    ...mockTaxon,
    id: faker.datatype.number( )
  }
}];

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockSuggestionsList
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

const mockRoute = {
  params: {
    observationUUID: faker.datatype.uuid( ),
    createRemoteIdentification: true
  }
};

const renderSuggestions = ( ) => renderComponent(
  <ObsEditContext.Provider value={{
    updateObservationKeys: jest.fn( ),
    photoEvidenceUris: [
      faker.image.imageUrl( ),
      faker.image.imageUrl( )
    ]
  }}
  >
    <SuggestionsContainer route={mockRoute} />
  </ObsEditContext.Provider>
);

describe( "Suggestions", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  test( "should not have accessibility errors", ( ) => {
    const suggestions = (
      <ObsEditContext.Provider value={{
        updateObservationKeys: jest.fn( ),
        photoEvidenceUris: [
          faker.image.imageUrl( ),
          faker.image.imageUrl( )
        ]
      }}
      >
        <SuggestionsContainer route={mockRoute} />
      </ObsEditContext.Provider>
    );
    expect( suggestions ).toBeAccessible( );
  } );

  it( "should render inside mocked container", ( ) => {
    renderSuggestions( );
    expect( screen.getByTestId( "mock-view-no-footer" ) ).toBeTruthy();
  } );
} );
