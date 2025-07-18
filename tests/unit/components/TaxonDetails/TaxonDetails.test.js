import { NavigationContainer, useNavigationState, useRoute } from "@react-navigation/native";
import {
  fireEvent, render, screen, waitFor
} from "@testing-library/react-native";
import TaxonDetails from "components/TaxonDetails/TaxonDetails";
import INatPaperProvider from "providers/INatPaperProvider";
import React from "react";
import { Linking } from "react-native";
import Photo from "realmModels/Photo.ts";
import { useAuthenticatedQuery } from "sharedHooks";
import * as useCurrentUser from "sharedHooks/useCurrentUser.ts";
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
  taxonPhotos: [{
    photo: factory( "RemotePhoto" )
  }]
} );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: jest.fn( ),
    useNavigation: jest.fn( ),
    useNavigationState: jest.fn( )
  };
} );

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  icon_url: faker.image.url( )
} );

const exploreRoute = { name: "Explore" };
const myObsRoute = { name: "ObsList" };
const obsEditRoute = { name: "ObsEdit" };
const suggestionsRoute = { name: "Suggestions" };
const taxonDetailsRoute = { name: "TaxonDetails" };
const taxonSearchRoute = { name: "TaxonSearch" };
const obsDetailsRoute = {
  name: "ObsDetails",
  params: {
    uuid: faker.string.uuid( )
  }
};
const aiCameraRoute = {
  name: "Camera",
  params: { camera: "AI" }
};

const renderTaxonDetails = ( ) => render(
  <INatPaperProvider>
    <NavigationContainer>
      <TaxonDetails />
    </NavigationContainer>
  </INatPaperProvider>
);

jest.mock(
  "sharedHooks/useAuthenticatedQuery",
  ( ) => ( {
    __esModule: true,
    default: jest.fn( ( ) => ( {
      data: null,
      isLoading: false,
      isError: false
    } ) )
  } )
);

jest.mock(
  "sharedHooks/useQuery",
  ( ) => ( {
    __esModule: true,
    default: jest.fn( ( ) => ( {
      data: null
    } ) )
  } )
);

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: ( ) => null
} ) );

describe( "TaxonDetails", ( ) => {
  beforeAll( ( ) => {
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( ( ) => mockUser );
    jest.useFakeTimers( );
  } );

  beforeEach( ( ) => {
    useAuthenticatedQuery.mockImplementation( ( ) => ( {
      data: mockTaxon,
      isLoading: false,
      isError: false
    } ) );
    useRoute.mockImplementation( ( ) => ( {
      params: { id: mockTaxon.id }
    } ) );
  } );

  it( "renders taxon photos from API response", async ( ) => {
    renderTaxonDetails( );
    expect( screen.getByTestId( `TaxonDetails.${mockTaxon.id}` ) ).toBeTruthy( );
    const photo
      = await screen.findByTestId( `TaxonDetails.photo.${mockTaxon.taxonPhotos[0].photo.id}` );
    expect( photo.props.source )
      .toStrictEqual( { uri: Photo.displayMediumPhoto( mockTaxon.taxonPhotos[0].photo.url ) } );
  } );

  // fails because of image carousel
  // test( "should not have accessibility errors", ( ) => {
  //   const taxonDetails = <TaxonDetails />;
  //   expect( taxonDetails ).toBeAccessible( );
  // } );

  it( "does not show sticky select taxon button on default screen", ( ) => {
    renderTaxonDetails( );
    const selectTaxonButton = screen.queryByText( /SELECT THIS TAXON/ );
    expect( selectTaxonButton ).toBeFalsy( );
  } );

  describe( "select button", ( ) => {
    beforeAll( ( ) => {
      useRoute.mockImplementation( ( ) => ( {
        params: { id: mockTaxon.id }
      } ) );
      jest.useFakeTimers( );
    } );

    function expectSelectButtonForPath( path ) {
      useNavigationState.mockImplementation( ( ) => ( { routes: path } ) );
      renderTaxonDetails( );
      expect( screen.getByText( /SELECT THIS TAXON/ ) ).toBeTruthy( );
    }

    function expectNoSelectButtonForPath( path ) {
      useNavigationState.mockImplementation( ( ) => ( { routes: path } ) );
      renderTaxonDetails( );
      expect( screen.queryByText( /SELECT THIS TAXON/ ) ).toBeFalsy( );
    }

    describe( "should appear", ( ) => {
      test( "from Explore via ObsDetails via Suggestions", ( ) => {
        expectSelectButtonForPath( [exploreRoute, obsDetailsRoute, suggestionsRoute] );
      } );

      test( "from Explore via ObsDetails via Suggestions via taxonomy", ( ) => {
        expectSelectButtonForPath( [
          exploreRoute,
          obsDetailsRoute,
          suggestionsRoute,
          taxonDetailsRoute
        ] );
      } );

      test( "from MyObs via ObsDetails via Suggestions", ( ) => {
        expectSelectButtonForPath( [myObsRoute, obsDetailsRoute, suggestionsRoute] );
      } );

      test( "from ObsEdit via Suggestions", ( ) => {
        expectSelectButtonForPath( [obsEditRoute, suggestionsRoute] );
      } );

      test( "from ObsEdit via Suggestions via taxonomy", ( ) => {
        expectSelectButtonForPath( [obsEditRoute, suggestionsRoute, taxonDetailsRoute] );
      } );

      test( "from ObsEdit via TaxonSearch", ( ) => {
        expectSelectButtonForPath( [obsEditRoute, taxonSearchRoute] );
      } );

      test( "from ObsEdit via TaxonSearch via taxonomy", ( ) => {
        expectSelectButtonForPath( [obsEditRoute, taxonSearchRoute, taxonDetailsRoute] );
      } );

      describe( "when logged out", ( ) => {
        test( "from Explore via ObsDetails via Suggestions", ( ) => {
          expectSelectButtonForPath( [exploreRoute, obsDetailsRoute, suggestionsRoute] );
        } );

        test( "from ObsEdit via Suggestions", ( ) => {
          expectSelectButtonForPath( [obsEditRoute, suggestionsRoute] );
        } );

        test( "from ObsEdit via Suggestions via taxonomy", ( ) => {
          expectSelectButtonForPath( [obsEditRoute, suggestionsRoute, taxonDetailsRoute] );
        } );
      } );
    } );

    describe( "should not appear", ( ) => {
      test( "from Explore", ( ) => {
        expectNoSelectButtonForPath( [exploreRoute] );
      } );

      test( "from Explore via taxonomy", ( ) => {
        expectNoSelectButtonForPath( [exploreRoute, taxonDetailsRoute] );
      } );

      test( "from Explore via ObsDetails", ( ) => {
        expectNoSelectButtonForPath( [exploreRoute, obsDetailsRoute] );
      } );

      test( "from MyObs via ObsDetails", ( ) => {
        expectNoSelectButtonForPath( [myObsRoute, obsDetailsRoute] );
      } );

      // I.e. when the user taps the info button next to the TaxonResult at
      // the top of the AICamera. We don't want them to land on ObsEdit from
      // AI Camera with no photo
      test( "from AICamera", ( ) => {
        expectNoSelectButtonForPath( [aiCameraRoute] );
      } );
    } );
  } );

  describe( "for taxon with Wikipedia content", ( ) => {
    const mockTaxonWithWikipedia = factory( "RemoteTaxon", {
      wikipedia_summary: faker.lorem.paragraph( ),
      wikipedia_url: faker.internet.url( )
    } );

    beforeEach( ( ) => {
      useAuthenticatedQuery.mockImplementation( ( ) => ( {
        data: mockTaxonWithWikipedia,
        isLoading: false,
        isError: false
      } ) );
      useRoute.mockImplementation( ( ) => ( {
        params: { id: mockTaxonWithWikipedia.id }
      } ) );
    } );

    it( "renders Wikipedia content form API response", async ( ) => {
      renderTaxonDetails( );
      expect( await screen.findByText( mockTaxonWithWikipedia.wikipedia_summary ) ).toBeTruthy( );
    } );

    it( "navigates to Wikipedia on button press", async ( ) => {
      renderTaxonDetails( );
      fireEvent.press( screen.getByTestId( "TaxonDetails.wikipedia" ) );
      await waitFor( ( ) => {
        expect( Linking.openURL ).toHaveBeenCalledTimes( 1 );
      } );
      expect( Linking.openURL ).toHaveBeenCalledWith( mockTaxonWithWikipedia.wikipedia_url );
    } );
  } );
} );
