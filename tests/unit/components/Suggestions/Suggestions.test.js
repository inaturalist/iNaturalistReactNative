import { faker } from "@faker-js/faker";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import SuggestionsContainer from "components/Suggestions/SuggestionsContainer";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import { ObsEditContext } from "providers/contexts";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";
// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );
jest.mock( "providers/ObsEditProvider" );

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
      addListener: jest.fn( )
    } )
  };
} );

const mockCreateId = jest.fn( );

const renderSuggestions = ( loading = false, comment = "" ) => renderComponent(
  <ObsEditContext.Provider value={{
    updateObservationKeys: jest.fn( ),
    photoEvidenceUris: [
      faker.image.imageUrl( ),
      faker.image.imageUrl( )
    ],
    createId: mockCreateId,
    loading,
    comment
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

  it( "should create an id when checkmark is pressed", ( ) => {
    renderSuggestions( );
    const testID = `SuggestionsList.taxa.${mockSuggestionsList[0].taxon.id}`;
    const checkmark = screen.getByTestId( `${testID}.checkmark` );
    expect( checkmark ).toBeVisible( );
    fireEvent.press( checkmark );
    expect( mockCreateId ).toHaveBeenCalled( );
  } );

  it( "should show loading wheel while id being created", async ( ) => {
    renderSuggestions( true );
    await waitFor( ( ) => {
      expect( screen.queryByTestId( "Suggestions.ActivityIndicator" ) ).toBeVisible( );
    } );
  } );

  it( "shows comment section if observation has comment", ( ) => {
    renderSuggestions( false, "Comment added to observation" );
    const commentSection = screen.getByText(
      i18next.t( "Your-identification-will-be-posted-with-the-following-comment" )
    );
    expect( commentSection ).toBeVisible( );
  } );
} );
