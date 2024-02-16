import { NavigationContainer } from "@react-navigation/native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import TaxonDetails from "components/TaxonDetails/TaxonDetails";
import initI18next from "i18n/initI18next";
import INatPaperProvider from "providers/INatPaperProvider";
import React from "react";
import { Linking } from "react-native";
import Photo from "realmModels/Photo";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );

const mockTaxon = factory( "RemoteTaxon", {
  name: faker.person.firstName( ),
  rank: "genus",
  rank_level: 27,
  preferred_common_name: faker.person.fullName( ),
  default_photo: {
    square_url: faker.image.url( )
  },
  ancestors: [{
    id: faker.number.int( ),
    preferred_common_name: faker.person.fullName( ),
    name: faker.person.fullName( ),
    rank: "class"
  }],
  wikipedia_summary: faker.lorem.paragraph( ),
  taxonPhotos: [{
    photo: factory( "RemotePhoto" )
  }],
  wikipedia_url: faker.internet.url( )
} );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        id: mockTaxon.id
      }
    } )
  };
} );

const renderTaxonDetails = ( ) => render(
  <INatPaperProvider>
    <NavigationContainer>
      <TaxonDetails />
    </NavigationContainer>
  </INatPaperProvider>
);

jest.mock(
  "../../../../src/sharedHooks/useAuthenticatedQuery",
  ( ) => ( {
    __esModule: true,
    default: ( queryKey, _queryFunction ) => {
      if ( queryKey[0] === "fetchTaxon" ) {
        return {
          data: mockTaxon,
          isLoading: false,
          isError: false
        };
      }
      return {
        data: null,
        isLoading: false,
        isError: false
      };
    }
  } )
);

describe( "TaxonDetails", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );
  test( "renders taxon details from API call", async ( ) => {
    renderTaxonDetails( );
    expect( screen.getByTestId( `TaxonDetails.${mockTaxon.id}` ) ).toBeTruthy( );
    expect( screen.getByTestId( "TaxonDetails.photo" ).props.source )
      .toStrictEqual( { uri: Photo.displayMediumPhoto( mockTaxon.taxonPhotos[0].photo.url ) } );
    expect( screen.getByText( mockTaxon.wikipedia_summary ) ).toBeTruthy( );
  } );

  test( "should not have accessibility errors", ( ) => {
    const taxonDetails = (
      <INatPaperProvider>
        <NavigationContainer>
          <TaxonDetails />
        </NavigationContainer>
      </INatPaperProvider>
    );
    expect( taxonDetails ).toBeAccessible( );
  } );

  test( "navigates to Wikipedia on button press", async ( ) => {
    renderTaxonDetails( );
    fireEvent.press( screen.getByTestId( "TaxonDetails.wikipedia" ) );
    expect( Linking.openURL ).toHaveBeenCalledTimes( 1 );
    expect( Linking.openURL ).toHaveBeenCalledWith( mockTaxon.wikipedia_url );
  } );
} );
