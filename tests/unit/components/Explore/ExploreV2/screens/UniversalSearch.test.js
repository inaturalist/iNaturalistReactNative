import { act, fireEvent, screen } from "@testing-library/react-native";
import UniversalSearch from "components/Explore/ExploreV2/screens/UniversalSearch";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import React from "react";
import { Keyboard } from "react-native";
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

jest.mock( "components/Explore/ExploreV2/hooks/useUniversalSearch" );
const useUniversalSearch = require(
  "components/Explore/ExploreV2/hooks/useUniversalSearch",
).default;

jest.mock( "components/Explore/ExploreV2/hooks/useLocationSearch" );
const useLocationSearch = require( "components/Explore/ExploreV2/hooks/useLocationSearch" ).default;

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
const useCurrentUser = require( "sharedHooks/useCurrentUser" ).default;

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

const PLACE_RESULTS = [
  {
    type: "place", id: 1, display_name: "Monterey, CA, US", place_type: 9,
  },
  {
    type: "place", id: 2, display_name: "Montenegro", place_type: 12,
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

const typeLocationQuery = text => {
  // Focus first so the list switches to location results.
  fireEvent( screen.getByTestId( "UniversalSearch.locationInput" ), "focus" );
  fireEvent.changeText( screen.getByTestId( "UniversalSearch.locationInput" ), text );
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
  useUniversalSearch.mockReturnValue( { results: [], isLoading: false, refetch: jest.fn( ) } );
  useLocationSearch.mockReturnValue( { results: [], isLoading: false, refetch: jest.fn( ) } );
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

  it( "fills the field but does not commit to context when a result is tapped", ( ) => {
    useUniversalSearch.mockReturnValue( {
      results: MIXED_RESULTS,
      isLoading: false,
      refetch: jest.fn( ),
    } );
    renderComponent( <UniversalSearch /> );

    typeQuery( "ver" );

    fireEvent.press( screen.getByTestId( "UniversalSearchResult.user.7" ) );

    // the selection is staged locally, not written to context until Search
    expect( mockDispatch ).not.toHaveBeenCalled( );
    // the search field is filled with the selected suggestion
    expect( screen.getByDisplayValue( "seth_msp" ) ).toBeTruthy( );
  } );

  it( "clears the field but keeps the staged subject when refocusing after a selection", ( ) => {
    useUniversalSearch.mockReturnValue( {
      results: MIXED_RESULTS,
      isLoading: false,
      refetch: jest.fn( ),
    } );
    renderComponent( <UniversalSearch /> );

    typeQuery( "ver" );
    fireEvent.press( screen.getByTestId( "UniversalSearchResult.user.7" ) );
    expect( screen.getByDisplayValue( "seth_msp" ) ).toBeTruthy( );

    fireEvent( screen.getByTestId( "UniversalSearch.subjectInput" ), "focus" );

    // the field is cleared for a fresh search...
    expect( screen.queryByDisplayValue( "seth_msp" ) ).toBeNull( );

    fireEvent.press( screen.getByTestId( "UniversalSearch.searchButton" ) );
    expect( mockDispatch ).toHaveBeenCalledWith(
      expect.objectContaining( {
        type: "SET_SUBJECT",
        subject: expect.objectContaining( {
          type: "user",
          user: expect.objectContaining( { id: 7, login: "seth_msp" } ),
        } ),
      } ),
    );
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

  it( "shows place autocomplete results while typing in the location field", ( ) => {
    useLocationSearch.mockReturnValue( {
      results: PLACE_RESULTS,
      isLoading: false,
      refetch: jest.fn( ),
    } );
    renderComponent( <UniversalSearch /> );

    typeLocationQuery( "mon" );

    expect( screen.getByTestId( "LocationSearchResult.1" ) ).toBeTruthy( );
    expect( screen.getByText( "Monterey, CA, US" ) ).toBeTruthy( );
    // place_type 9 maps to "County"
    expect( screen.getByText( "County" ) ).toBeTruthy( );
  } );

  it( "does not show place results while the subject field is focused", ( ) => {
    useLocationSearch.mockReturnValue( {
      results: PLACE_RESULTS,
      isLoading: false,
      refetch: jest.fn( ),
    } );
    renderComponent( <UniversalSearch /> );

    // Subject is the initial active field; location results should be hidden.
    typeQuery( "ver" );

    expect( screen.queryByTestId( "LocationSearchResult.1" ) ).toBeNull( );
  } );

  it( "swaps back to subject results when the subject field is refocused", ( ) => {
    useUniversalSearch.mockReturnValue( {
      results: MIXED_RESULTS,
      isLoading: false,
      refetch: jest.fn( ),
    } );
    useLocationSearch.mockReturnValue( {
      results: PLACE_RESULTS,
      isLoading: false,
      refetch: jest.fn( ),
    } );
    renderComponent( <UniversalSearch /> );

    // Type a subject query, then move to the location field and query there.
    typeQuery( "ver" );
    typeLocationQuery( "mon" );
    expect( screen.getByTestId( "LocationSearchResult.1" ) ).toBeTruthy( );
    expect( screen.queryByText( "seth_msp" ) ).toBeNull( );

    // Refocusing the subject field brings the subject results back.
    fireEvent( screen.getByTestId( "UniversalSearch.subjectInput" ), "focus" );

    expect( screen.getByText( "seth_msp" ) ).toBeTruthy( );
    expect( screen.queryByTestId( "LocationSearchResult.1" ) ).toBeNull( );
  } );

  it( "fills the field and dismisses the keyboard on place selection, without committing", ( ) => {
    const dismissSpy = jest.spyOn( Keyboard, "dismiss" ).mockImplementation( ( ) => {} );
    useLocationSearch.mockReturnValue( {
      results: PLACE_RESULTS,
      isLoading: false,
      refetch: jest.fn( ),
    } );
    renderComponent( <UniversalSearch /> );

    typeLocationQuery( "mon" );
    fireEvent.press( screen.getByTestId( "LocationSearchResult.1" ) );

    // the location field is filled with the selected place
    expect( screen.getByDisplayValue( "Monterey, CA, US" ) ).toBeTruthy( );
    expect( dismissSpy ).toHaveBeenCalled( );

    dismissSpy.mockRestore( );
  } );

  it( "navigates to Advanced Search", ( ) => {
    renderComponent( <UniversalSearch /> );

    fireEvent.press( screen.getByText( i18next.t( "Advanced-Search" ) ) );

    expect( mockNavigate ).toHaveBeenCalledWith( "AdvancedSearch" );
  } );

  describe( "search submission", ( ) => {
    const selectSubject = ( ) => {
      useUniversalSearch.mockReturnValue( {
        results: MIXED_RESULTS,
        isLoading: false,
        refetch: jest.fn( ),
      } );
      typeQuery( "ver" );
      fireEvent.press( screen.getByTestId( "UniversalSearchResult.user.7" ) );
    };

    // Stage a location pick on this instance of the screen.
    const selectPlace = ( ) => {
      useLocationSearch.mockReturnValue( {
        results: PLACE_RESULTS,
        isLoading: false,
        refetch: jest.fn( ),
      } );
      typeLocationQuery( "mon" );
      fireEvent.press( screen.getByTestId( "LocationSearchResult.1" ) );
    };

    const pressSearch = ( ) => fireEvent.press(
      screen.getByTestId( "UniversalSearch.searchButton" ),
    );

    it( "navigates to ExploreResults when the search button is pressed", ( ) => {
      renderComponent( <UniversalSearch /> );

      pressSearch( );

      expect( mockNavigate ).toHaveBeenCalledWith( "ExploreResults" );
    } );

    it( "commits all organisms + worldwide when nothing is selected", ( ) => {
      renderComponent( <UniversalSearch /> );

      pressSearch( );

      expect( mockDispatch ).toHaveBeenCalledWith( { type: "CLEAR_SUBJECT" } );
      expect( mockDispatch ).toHaveBeenCalledWith( { type: "SET_LOCATION_WORLDWIDE" } );
    } );

    it( "commits the subject + worldwide when only a subject is selected", ( ) => {
      renderComponent( <UniversalSearch /> );

      selectSubject( );
      pressSearch( );

      expect( mockDispatch ).toHaveBeenCalledWith(
        expect.objectContaining( {
          type: "SET_SUBJECT",
          subject: expect.objectContaining( {
            type: "user",
            user: expect.objectContaining( { id: 7 } ),
          } ),
        } ),
      );
      // location was left untouched → worldwide
      expect( mockDispatch ).toHaveBeenCalledWith( { type: "SET_LOCATION_WORLDWIDE" } );
    } );

    it( "commits all organisms + the place when only a location is selected", ( ) => {
      renderComponent( <UniversalSearch /> );

      selectPlace( );
      pressSearch( );

      // subject was left untouched → all organisms
      expect( mockDispatch ).toHaveBeenCalledWith( { type: "CLEAR_SUBJECT" } );
      expect( mockDispatch ).toHaveBeenCalledWith( {
        type: "SET_LOCATION_PLACE",
        place: { id: 1, display_name: "Monterey, CA, US" },
      } );
    } );

    it( "commits both when a subject and a location are selected", ( ) => {
      renderComponent( <UniversalSearch /> );

      selectSubject( );
      selectPlace( );
      pressSearch( );

      expect( mockDispatch ).toHaveBeenCalledWith(
        expect.objectContaining( { type: "SET_SUBJECT" } ),
      );
      expect( mockDispatch ).toHaveBeenCalledWith( {
        type: "SET_LOCATION_PLACE",
        place: { id: 1, display_name: "Monterey, CA, US" },
      } );
      expect( mockDispatch ).not.toHaveBeenCalledWith( { type: "CLEAR_SUBJECT" } );
      expect( mockDispatch ).not.toHaveBeenCalledWith( { type: "SET_LOCATION_WORLDWIDE" } );
    } );

    it( "does not commit anything after Reset clears the staged selections", ( ) => {
      renderComponent( <UniversalSearch /> );

      selectSubject( );
      selectPlace( );
      fireEvent.press( screen.getByText( i18next.t( "Reset-verb" ) ) );

      pressSearch( );

      // Reset cleared the staged picks, so Search falls back to the defaults.
      expect( mockDispatch ).toHaveBeenCalledWith( { type: "CLEAR_SUBJECT" } );
      expect( mockDispatch ).toHaveBeenCalledWith( { type: "SET_LOCATION_WORLDWIDE" } );
    } );

    it( "dismisses the keyboard when the search button is pressed", ( ) => {
      const dismissSpy = jest.spyOn( Keyboard, "dismiss" ).mockImplementation( ( ) => {} );
      renderComponent( <UniversalSearch /> );

      pressSearch( );

      expect( dismissSpy ).toHaveBeenCalled( );

      dismissSpy.mockRestore( );
    } );
  } );
} );
