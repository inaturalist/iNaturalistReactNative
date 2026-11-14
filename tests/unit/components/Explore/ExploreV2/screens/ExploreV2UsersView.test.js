import { screen, userEvent } from "@testing-library/react-native";
import { fetchIdentifiers, fetchObservers } from "api/observations";
import { IDENTIFIERS_TAB, OBSERVERS_TAB } from "appConstants/tabs";
import ExploreV2UsersView
  from "components/Explore/ExploreV2/screens/ExploreV2UsersView";
import initI18next from "i18n/initI18next";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockObservers = [
  { user: factory( "RemoteUser", { id: 1, login: "carrieseltzer" } ), observation_count: 22 },
  { user: factory( "RemoteUser", { id: 2, login: "kueda" } ), observation_count: 11 },
];

const mockIdentifiers = [
  { user: factory( "RemoteUser", { id: 3, login: "loarie" } ), count: 9 },
  { user: factory( "RemoteUser", { id: 4, login: "tiwane" } ), count: 4 },
];

const mockedNavigate = jest.fn( );
jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( { navigate: mockedNavigate } ),
  };
} );

const mockUseInfiniteScroll = jest.fn( );
jest.mock( "sharedHooks/useInfiniteScroll", () => ( {
  __esModule: true,
  default: ( ...args ) => mockUseInfiniteScroll( ...args ),
} ) );

const PARAMS = { taxon_id: 12, place_id: 1 };

const renderUsers = ( props = {} ) => renderComponent(
  <ExploreV2UsersView
    enabled
    isConnected
    params={PARAMS}
    tab={OBSERVERS_TAB}
    {...props}
  />,
);

const mockResults = results => mockUseInfiniteScroll.mockReturnValue( {
  data: results,
  fetchNextPage: jest.fn( ),
  isFetchingNextPage: false,
  totalResults: results.length,
} );

beforeAll( async ( ) => {
  await initI18next( );
} );

beforeEach( ( ) => {
  mockedNavigate.mockClear( );
  mockUseInfiniteScroll.mockReset( );
  mockResults( mockObservers );
} );

describe( "ExploreV2UsersView", ( ) => {
  describe( "observers tab", ( ) => {
    it( "lists observers with their observation counts", ( ) => {
      renderUsers( );

      expect( screen.getByText( "carrieseltzer" ) ).toBeVisible( );
      expect( screen.getByText( "22 Observations" ) ).toBeVisible( );
      expect( screen.getByText( "kueda" ) ).toBeVisible( );
    } );

    it( "navigates to a user profile when an observer is pressed", async ( ) => {
      const actor = userEvent.setup( );
      renderUsers( );

      await actor.press( screen.getByTestId( "UserProfile.1" ) );

      expect( mockedNavigate ).toHaveBeenCalledWith( "UserProfile", { userId: 1 } );
    } );

    it( "queries observers, sorted by observation count, with the search params", ( ) => {
      renderUsers( );

      const [queryKey, fetchUsers, params] = mockUseInfiniteScroll.mock.calls.at( -1 );
      expect( queryKey ).toBe( "exploreV2Observers" );
      expect( fetchUsers ).toBe( fetchObservers );
      expect( params.order_by ).toBe( "observation_count" );
      expect( params.taxon_id ).toBe( 12 );
      expect( params.place_id ).toBe( 1 );
    } );
  } );

  describe( "identifiers tab", ( ) => {
    beforeEach( ( ) => {
      mockResults( mockIdentifiers );
    } );

    it( "lists identifiers with their identification counts", ( ) => {
      renderUsers( { tab: IDENTIFIERS_TAB } );

      expect( screen.getByText( "loarie" ) ).toBeVisible( );
      expect( screen.getByText( "9 Identifications" ) ).toBeVisible( );
      expect( screen.getByText( "tiwane" ) ).toBeVisible( );
    } );

    it( "queries identifiers, without an observers sort, with the search params", ( ) => {
      renderUsers( { tab: IDENTIFIERS_TAB } );

      const [queryKey, fetchUsers, params] = mockUseInfiniteScroll.mock.calls.at( -1 );
      expect( queryKey ).toBe( "exploreV2Identifiers" );
      expect( fetchUsers ).toBe( fetchIdentifiers );
      expect( params.order_by ).toBeUndefined( );
      expect( params.taxon_id ).toBe( 12 );
      expect( params.place_id ).toBe( 1 );
    } );
  } );

  it( "passes the disabled flag through to the query", ( ) => {
    renderUsers( { enabled: false } );

    expect( mockUseInfiniteScroll.mock.calls.at( -1 )[3] ).toEqual( { enabled: false } );
  } );
} );
