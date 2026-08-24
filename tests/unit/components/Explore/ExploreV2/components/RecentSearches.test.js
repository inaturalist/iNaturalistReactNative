import { screen, userEvent } from "@testing-library/react-native";
import RecentSearches from "components/Explore/ExploreV2/components/RecentSearches";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import React from "react";
import useStore from "stores/useStore";
import { renderComponent } from "tests/helpers/render";

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
const useCurrentUser = require( "sharedHooks/useCurrentUser" ).default;

const CURRENT_USER = { id: 99, login: "tester", prefers_common_names: true };

const TAXON_SUBJECT = {
  type: "taxon",
  taxon: {
    id: 12,
    name: "Eumyias thalassinus",
    preferred_common_name: "Verditer Flycatcher",
    iconic_taxon_name: "Aves",
    default_photo: { url: "https://example.com/t.jpg" },
  },
};

const USER_SUBJECT = {
  type: "user",
  user: {
    id: 7,
    login: "seth_msp",
    icon_url: "https://example.com/u.jpg",
    observations_count: 5,
  },
};

const PROJECT_SUBJECT = {
  type: "project",
  project: {
    id: 9,
    title: "InverteFest",
    project_type: "collection",
    rule_preferences: [],
    icon: "https://example.com/p.jpg",
  },
};

const recents = ( ) => useStore.getState( ).exploreRecentSearches;

const rowTestIDs = ( ) => screen
  .getAllByTestId( /^UniversalSearchResult\.(taxon|user|project)\./ )
  .map( row => row.props.testID );

const actor = userEvent.setup( );

beforeAll( async ( ) => {
  await initI18next( );
} );

beforeEach( ( ) => {
  recents( ).clearRecents( );
  useCurrentUser.mockReturnValue( CURRENT_USER );
} );

describe( "RecentSearches", ( ) => {
  it( "renders nothing when there are no recent searches", ( ) => {
    renderComponent( <RecentSearches onSelectSubject={jest.fn( )} /> );

    expect( screen.queryByTestId( "RecentSearches" ) ).toBeNull( );
  } );

  it( "renders a row per recent subject, newest first", ( ) => {
    recents( ).recordSubject( PROJECT_SUBJECT );
    recents( ).recordSubject( USER_SUBJECT );
    recents( ).recordSubject( TAXON_SUBJECT );
    renderComponent( <RecentSearches onSelectSubject={jest.fn( )} /> );

    expect( screen.getByTestId( "RecentSearches" ) ).toBeVisible( );
    expect( rowTestIDs( ) ).toEqual( [
      "UniversalSearchResult.taxon.12",
      "UniversalSearchResult.user.7",
      "UniversalSearchResult.project.9",
    ] );
    expect( screen.getByText( "InverteFest" ) ).toBeVisible( );
    expect( screen.getByText( "seth_msp" ) ).toBeVisible( );
    // The stored subject carries the count, so the row needs no refetch
    expect( screen.getByText( i18next.t( "X-Observations", { count: 5 } ) ) ).toBeVisible( );
  } );

  it( "omits subjects with no search result form", ( ) => {
    recents( ).recordSubject( { type: "unknown" } );
    recents( ).recordSubject( { type: "unobserved", user: { id: 7 } } );
    renderComponent( <RecentSearches onSelectSubject={jest.fn( )} /> );

    expect( screen.queryByTestId( "RecentSearches" ) ).toBeNull( );
  } );

  it( "does not repeat the current user", ( ) => {
    recents( ).recordSubject( { type: "user", user: { id: CURRENT_USER.id, login: "tester" } } );
    recents( ).recordSubject( TAXON_SUBJECT );
    renderComponent( <RecentSearches onSelectSubject={jest.fn( )} /> );

    expect( screen.queryByText( "tester" ) ).toBeNull( );
    expect( screen.getByTestId( "UniversalSearchResult.taxon.12" ) ).toBeVisible( );
  } );

  it( "passes the tapped subject to onSelectSubject", async ( ) => {
    const onSelectSubject = jest.fn( );
    recents( ).recordSubject( TAXON_SUBJECT );
    renderComponent( <RecentSearches onSelectSubject={onSelectSubject} /> );

    await actor.press( screen.getByTestId( "UniversalSearchResult.taxon.12" ) );

    expect( onSelectSubject ).toHaveBeenCalledWith( TAXON_SUBJECT );
  } );
} );
