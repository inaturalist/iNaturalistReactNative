import { act, fireEvent, screen } from "@testing-library/react-native";
import UniversalSearch from "components/Explore/ExploreV2/screens/UniversalSearch";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import React from "react";
import { renderComponent } from "tests/helpers/render";

const mockNavigate = jest.fn( );
jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      navigate: mockNavigate,
      goBack: jest.fn( ),
      canGoBack: ( ) => true,
    } ),
  };
} );

const mockDispatch = jest.fn( );
jest.mock( "providers/ExploreV2Context", ( ) => {
  const actual = jest.requireActual( "providers/ExploreV2Context" );
  return {
    ...actual,
    useExploreV2: jest.fn( ),
  };
} );
const { useExploreV2 } = require( "providers/ExploreV2Context" );

jest.mock( "sharedHooks/useUniversalSearch" );
const useUniversalSearch = require( "sharedHooks/useUniversalSearch" ).default;

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
const useCurrentUser = require( "sharedHooks/useCurrentUser" ).default;

jest.mock( "sharedHooks/useIconicTaxa", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
const useIconicTaxa = require( "sharedHooks/useIconicTaxa" ).default;

const ICONIC_TAXA = [
  {
    id: 47126,
    name: "Plantae",
    iconic_taxon_name: "Plantae",
    preferred_common_name: "Plants",
  },
  {
    id: 3,
    name: "Aves",
    iconic_taxon_name: "Aves",
    preferred_common_name: "Birds",
  },
];

const CURRENT_USER = {
  id: 99,
  login: "tester",
  icon_url: null,
  observations_count: 42,
  prefers_common_names: true,
  prefers_scientific_name_first: false,
};

const MIXED_RESULTS = [
  {
    type: "user",
    user: {
      id: 7,
      login: "seth_msp",
      icon_url: "https://example.com/u.jpg",
      observations_count: 5,
    },
  },
  {
    type: "taxon",
    taxon: {
      id: 12,
      name: "Eumyias thalassinus",
      preferred_common_name: "Verditer Flycatcher",
      iconic_taxon_name: "Aves",
      default_photo: { url: "https://example.com/t.jpg" },
    },
  },
  {
    type: "project",
    project: {
      id: 9,
      title: "InverteFest",
      project_type: "collection",
      rule_preferences: [],
      icon: "https://example.com/p.jpg",
    },
  },
];

const typeQuery = text => {
  fireEvent.changeText( screen.getByTestId( "UniversalSearch.subjectInput" ), text );
  // Only the timer advancement needs an act wrapper; fireEvent is already
  // wrapped internally by Testing Library.
  act( ( ) => {
    jest.advanceTimersByTime( 400 );
  } );
};

beforeAll( async ( ) => {
  await initI18next( );
} );

beforeEach( ( ) => {
  jest.useFakeTimers( );
  mockNavigate.mockClear( );
  mockDispatch.mockClear( );
  useExploreV2.mockReturnValue( { dispatch: mockDispatch, state: {} } );
  useCurrentUser.mockReturnValue( CURRENT_USER );
  useIconicTaxa.mockReturnValue( ICONIC_TAXA );
  useUniversalSearch.mockReturnValue( { results: [], isLoading: false, refetch: jest.fn( ) } );
} );

afterEach( ( ) => {
  jest.useRealTimers( );
} );

describe( "UniversalSearch screen", ( ) => {
  it( "renders the core layout", ( ) => {
    renderComponent( <UniversalSearch /> );

    expect( screen.getByTestId( "UniversalSearch" ) ).toBeTruthy( );
    expect( screen.getByTestId( "UniversalSearch.subjectInput" ) ).toBeTruthy( );
    expect( screen.getByTestId( "UniversalSearch.locationInput" ) ).toBeTruthy( );
    expect( screen.getByTestId( "UniversalSearch.searchButton" ) ).toBeTruthy( );
    expect( screen.getByTestId( "UniversalSearch.back" ) ).toBeTruthy( );
  } );

  it( "updates the controlled inputs as the user types", ( ) => {
    renderComponent( <UniversalSearch /> );

    fireEvent.changeText( screen.getByTestId( "UniversalSearch.subjectInput" ), "cup plant" );
    fireEvent.changeText( screen.getByTestId( "UniversalSearch.locationInput" ), "California" );

    expect( screen.getByDisplayValue( "cup plant" ) ).toBeTruthy( );
    expect( screen.getByDisplayValue( "California" ) ).toBeTruthy( );
  } );

  it( "clears both fields when reset is pressed", ( ) => {
    renderComponent( <UniversalSearch /> );

    fireEvent.changeText( screen.getByTestId( "UniversalSearch.subjectInput" ), "cup plant" );
    fireEvent.changeText( screen.getByTestId( "UniversalSearch.locationInput" ), "California" );

    fireEvent.press( screen.getByText( i18next.t( "Reset-verb" ) ) );

    expect( screen.queryByDisplayValue( "cup plant" ) ).toBeNull( );
    expect( screen.queryByDisplayValue( "California" ) ).toBeNull( );
  } );

  it( "shows mixed autocomplete results while typing", ( ) => {
    useUniversalSearch.mockReturnValue( {
      results: MIXED_RESULTS,
      isLoading: false,
      refetch: jest.fn( ),
    } );
    renderComponent( <UniversalSearch /> );

    typeQuery( "ver" );

    expect( screen.getByText( "seth_msp" ) ).toBeTruthy( );
    expect( screen.getByText( "InverteFest" ) ).toBeTruthy( );
    expect( screen.getByTestId( "UniversalSearchResult.taxon.12" ) ).toBeTruthy( );
    // each row has a (no-op) info icon
    expect( screen.getByTestId( "UniversalSearchResult.info.7" ) ).toBeTruthy( );
  } );

  it( "fills the field and sets the subject when a result is tapped", ( ) => {
    useUniversalSearch.mockReturnValue( {
      results: MIXED_RESULTS,
      isLoading: false,
      refetch: jest.fn( ),
    } );
    renderComponent( <UniversalSearch /> );

    typeQuery( "ver" );

    fireEvent.press( screen.getByTestId( "UniversalSearchResult.user.7" ) );

    expect( mockDispatch ).toHaveBeenCalledWith(
      expect.objectContaining( {
        type: "SET_SUBJECT",
        subject: expect.objectContaining( {
          type: "user",
          user: expect.objectContaining( { id: 7, login: "seth_msp" } ),
        } ),
      } ),
    );
    // the search field is filled with the selected suggestion
    expect( screen.getByDisplayValue( "seth_msp" ) ).toBeTruthy( );
  } );

  it( "clears the field but keeps the subject when tapping back in after a selection", ( ) => {
    useUniversalSearch.mockReturnValue( {
      results: MIXED_RESULTS,
      isLoading: false,
      refetch: jest.fn( ),
    } );
    renderComponent( <UniversalSearch /> );

    typeQuery( "ver" );
    fireEvent.press( screen.getByTestId( "UniversalSearchResult.user.7" ) );
    expect( screen.getByDisplayValue( "seth_msp" ) ).toBeTruthy( );

    mockDispatch.mockClear( );
    fireEvent( screen.getByTestId( "UniversalSearch.subjectInput" ), "focus" );

    // the field is cleared for a fresh search...
    expect( screen.queryByDisplayValue( "seth_msp" ) ).toBeNull( );
    // ...but the committed subject persists (only Reset / a new selection clears it)
    expect( mockDispatch ).not.toHaveBeenCalledWith( { type: "CLEAR_SUBJECT" } );
  } );

  it( "shows an empty-state message when a query returns no results", ( ) => {
    useUniversalSearch.mockReturnValue( { results: [], isLoading: false, refetch: jest.fn( ) } );
    renderComponent( <UniversalSearch /> );

    typeQuery( "zzzzz" );

    expect(
      screen.getByText( i18next.t( "No-results-found-for-that-search" ) ),
    ).toBeTruthy( );
  } );

  it( "does not show the empty-state message while results are loading", ( ) => {
    useUniversalSearch.mockReturnValue( { results: [], isLoading: true, refetch: jest.fn( ) } );
    renderComponent( <UniversalSearch /> );

    typeQuery( "ver" );

    expect(
      screen.queryByText( i18next.t( "No-results-found-for-that-search" ) ),
    ).toBeNull( );
  } );

  it( "does not show results until the user has typed a query", ( ) => {
    useUniversalSearch.mockReturnValue( {
      results: MIXED_RESULTS,
      isLoading: false,
      refetch: jest.fn( ),
    } );
    renderComponent( <UniversalSearch /> );

    // No query typed yet, so the result list is not rendered even though the
    // hook would return data.
    expect( screen.queryByText( "seth_msp" ) ).toBeNull( );
    expect(
      screen.queryByText( i18next.t( "No-results-found-for-that-search" ) ),
    ).toBeNull( );
  } );

  describe( "default search options (empty query)", ( ) => {
    it( "shows the iconic taxa row, current user, and unobserved shortcut", ( ) => {
      renderComponent( <UniversalSearch /> );

      expect( screen.getByTestId( "DefaultSearchOptions" ) ).toBeTruthy( );
      expect( screen.getByTestId( "DefaultSearchOptions.iconicTaxonButton.47126" ) ).toBeTruthy( );
      // current user's profile row, reusing the user result row
      expect( screen.getByTestId( "UniversalSearchResult.user.99" ) ).toBeTruthy( );
      expect( screen.getByText( "tester" ) ).toBeTruthy( );
      // "Species I haven't observed" shortcut
      expect( screen.getByText( i18next.t( "Species-I-havent-observed" ) ) ).toBeTruthy( );
    } );

    it( "fills the field and sets the subject when an iconic taxon is tapped", ( ) => {
      renderComponent( <UniversalSearch /> );

      fireEvent.press( screen.getByTestId( "DefaultSearchOptions.iconicTaxonButton.47126" ) );

      expect( mockDispatch ).toHaveBeenCalledWith(
        expect.objectContaining( {
          type: "SET_SUBJECT",
          subject: expect.objectContaining( {
            type: "taxon",
            taxon: expect.objectContaining( { id: 47126, name: "Plantae" } ),
          } ),
        } ),
      );
      // common name is primary for the test user, so the field shows "Plants"
      expect( screen.getByDisplayValue( "Plants" ) ).toBeTruthy( );
    } );

    it( "sets the current user as the subject when their profile row is tapped", ( ) => {
      renderComponent( <UniversalSearch /> );

      fireEvent.press( screen.getByTestId( "UniversalSearchResult.user.99" ) );

      expect( mockDispatch ).toHaveBeenCalledWith(
        expect.objectContaining( {
          type: "SET_SUBJECT",
          subject: expect.objectContaining( {
            type: "user",
            user: expect.objectContaining( { id: 99, login: "tester" } ),
          } ),
        } ),
      );
      expect( screen.getByDisplayValue( "tester" ) ).toBeTruthy( );
    } );

    it( "hides the current user row when logged out", ( ) => {
      useCurrentUser.mockReturnValue( null );
      renderComponent( <UniversalSearch /> );

      expect( screen.queryByTestId( "UniversalSearchResult.user.99" ) ).toBeNull( );
      // the iconic taxa row and unobserved shortcut still render
      expect( screen.getByTestId( "DefaultSearchOptions.iconicTaxonButton.47126" ) ).toBeTruthy( );
      expect( screen.getByText( i18next.t( "Species-I-havent-observed" ) ) ).toBeTruthy( );
    } );
  } );

  it( "navigates to Advanced Search", ( ) => {
    renderComponent( <UniversalSearch /> );

    fireEvent.press( screen.getByText( i18next.t( "Advanced-Search" ) ) );

    expect( mockNavigate ).toHaveBeenCalledWith( "AdvancedSearch" );
  } );
} );
