import { faker } from "@faker-js/faker";
import {
  fireEvent,
  screen, waitFor
} from "@testing-library/react-native";
import Suggestions from "components/Suggestions/Suggestions";
import SuggestionsContainer from "components/Suggestions/SuggestionsContainer";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import React from "react";
import useStore from "stores/useStore";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockObservation = factory( "RemoteObservation" );

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

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( {
    data: mockSuggestionsList,
    isLoading: false
  } )
} ) );

// Mock api call to observations
jest.mock( "inaturalistjs" );

const renderSuggestions = ( ) => renderComponent(
  <SuggestionsContainer />
);

const initialStoreState = useStore.getState( );

describe( "Suggestions", ( ) => {
  beforeAll( async ( ) => {
    useStore.setState( initialStoreState, true );
    await initI18next( );
  } );

  test( "should not have accessibility errors", async ( ) => {
    renderSuggestions( );

    const suggestions = await screen.findByTestId( "suggestions" );
    expect( suggestions ).toBeAccessible( );
  } );

  it( "should fetch nearby suggestions for current photo", async ( ) => {
    renderSuggestions( );
    const taxonTopResult = screen.getByTestId(
      `SuggestionsList.taxa.${mockSuggestionsList[0].taxon.id}`
    );
    await waitFor( ( ) => {
      expect( taxonTopResult ).toBeVisible( );
    } );
  } );

  it( "should show loading wheel while id being created", async ( ) => {
    useStore.setState( {
      observations: [mockObservation],
      currentObservationIndex: 0
    } );
    renderSuggestions( );
    const taxonTopResult = screen.getByTestId(
      `SuggestionsList.taxa.${mockSuggestionsList[0].taxon.id}`
    );
    await waitFor( ( ) => {
      expect( taxonTopResult ).toBeVisible( );
    } );
    const taxonCheckmark = screen.getByTestId(
      `SuggestionsList.taxa.${mockSuggestionsList[0].taxon.id}.checkmark`
    );
    fireEvent.press( taxonCheckmark );
    await waitFor( ( ) => {
      expect( screen.queryByTestId( "Suggestions.ActivityIndicator" ) ).toBeVisible( );
    } );
  } );

  it( "shows comment section if observation has comment", ( ) => {
    renderComponent(
      <Suggestions
        comment="Comment added to observation"
      />
    );
    const commentSection = screen.getByText(
      i18next.t( "Your-identification-will-be-posted-with-the-following-comment" )
    );
    expect( commentSection ).toBeVisible( );
  } );
} );
