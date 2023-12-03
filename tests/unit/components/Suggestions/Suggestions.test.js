import { faker } from "@faker-js/faker";
import {
  fireEvent,
  screen, waitFor
} from "@testing-library/react-native";
import SuggestionsContainer from "components/Suggestions/SuggestionsContainer";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import { ObsEditContext } from "providers/contexts";
import React from "react";

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

// Mock api call to observations
jest.mock( "inaturalistjs" );

const mockUris = [
  faker.image.url( ),
  `${faker.image.url( )}/400`
];

const mockCreateId = jest.fn( );

const renderSuggestions = ( comment = "" ) => renderComponent(
  <ObsEditContext.Provider value={{
    updateObservationKeys: jest.fn( ),
    photoEvidenceUris: mockUris,
    createId: mockCreateId,
    comment,
    currentObservation: {
      uuid: faker.string.uuid( ),
      latitude: 41,
      longitude: -143
    },
    setPhotoEvidenceUris: jest.fn( )
  }}
  >
    <SuggestionsContainer />
  </ObsEditContext.Provider>
);

describe( "Suggestions", ( ) => {
  beforeAll( async ( ) => {
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
    renderSuggestions( "Comment added to observation" );
    const commentSection = screen.getByText(
      i18next.t( "Your-identification-will-be-posted-with-the-following-comment" )
    );
    expect( commentSection ).toBeVisible( );
  } );
} );
