import { faker } from "@faker-js/faker";
import {
  screen, waitFor
} from "@testing-library/react-native";
import SuggestionsContainer from "components/Suggestions/SuggestionsContainer";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import React from "react";
import useStore from "stores/useStore";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockTaxon = factory( "RemoteTaxon", {
  name: faker.person.firstName( ),
  preferred_common_name: faker.person.fullName( ),
  default_photo: {
    square_url: faker.image.url( )
  }
} );

const mockSuggestionsList = [{
  combined_score: 90.34,
  taxon: {
    ...mockTaxon,
    id: faker.number.int( )
  }
}, {
  combined_score: 30.32,
  taxon: {
    ...mockTaxon,
    id: faker.number.int( )
  }
}];

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( {
    data: mockSuggestionsList,
    isLoading: false
  } )
} ) );

const mockOfflinePrediction = {
  score: 0.97363,
  taxon: {
    rank_level: 10,
    name: "Felis Catus",
    id: 118552
  }
};

jest.mock( "components/Suggestions/hooks/useOfflineSuggestions", () => ( {
  __esModule: true,
  default: ( ) => ( {
    offlineSuggestions: [mockOfflinePrediction],
    loadingOfflineSuggestions: false
  } )
} ) );

// Mock api call to observations
jest.mock( "inaturalistjs" );

const initialStoreState = useStore.getState( );

describe( "Suggestions", ( ) => {
  beforeAll( async ( ) => {
    useStore.setState( initialStoreState, true );
    await initI18next( );
  } );

  test( "should not have accessibility errors", async ( ) => {
    renderComponent( <SuggestionsContainer /> );

    const suggestions = await screen.findByTestId( "suggestions" );
    expect( suggestions ).toBeAccessible( );
  } );

  it( "should fetch offline suggestions for current photo", async ( ) => {
    renderComponent( <SuggestionsContainer /> );
    const taxonTopResult = screen.getByTestId(
      `SuggestionsList.taxa.${mockOfflinePrediction.taxon.id}`
    );
    await waitFor( ( ) => {
      expect( taxonTopResult ).toBeVisible( );
    } );
  } );

  // it( "should fetch nearby suggestions for current photo", async ( ) => {
  //   renderComponent( <SuggestionsContainer /> );
  //   const taxonTopResult = screen.getByTestId(
  //     `SuggestionsList.taxa.${mockSuggestionsList[0].taxon.id}`
  //   );
  //   await waitFor( ( ) => {
  //     expect( taxonTopResult ).toBeVisible( );
  //   } );
  // } );

  it( "shows comment section if observation has comment", ( ) => {
    useStore.setState( {
      comment: "This is a test comment"
    } );
    renderComponent( <SuggestionsContainer /> );
    const commentSection = screen.getByText(
      i18next.t( "Your-identification-will-be-posted-with-the-following-comment" )
    );
    expect( commentSection ).toBeVisible( );
  } );
} );
