import { faker } from "@faker-js/faker";
import {
  screen, waitFor
} from "@testing-library/react-native";
import SuggestionsContainer from "components/Suggestions/SuggestionsContainer";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import inatjs from "inaturalistjs";
import { ObsEditContext } from "providers/contexts";
import React from "react";

import factory, { makeResponse } from "../../../factory";
import { renderComponent } from "../../../helpers/render";

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

// Mock api call to observations
jest.mock( "inaturalistjs" );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      addListener: jest.fn( )
    } )
  };
} );

jest.mock( "sharedHooks/useLocalObservation" );

const mockUris = [
  faker.image.imageUrl( ),
  `${faker.image.imageUrl( )}/400`
];

const mockCreateId = jest.fn( );

const renderSuggestions = ( loading = false, comment = "" ) => renderComponent(
  <ObsEditContext.Provider value={{
    updateObservationKeys: jest.fn( ),
    photoEvidenceUris: mockUris,
    createId: mockCreateId,
    loading,
    comment,
    currentObservation: {
      uuid: faker.datatype.uuid( )
    }
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

  it( "should fetch nearby suggestions for current photo", async ( ) => {
    renderSuggestions( );
    await waitFor( ( ) => {
      inatjs.observations.observers.mockResolvedValue( makeResponse( [] ) );
      inatjs.computervision.score_image.mockResolvedValue( makeResponse( mockSuggestionsList ) );
      expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 1 );
    } );
  } );
} );
