import {
  act, fireEvent, screen, userEvent, waitFor,
} from "@testing-library/react-native";
import UniversalSearch from "components/Explore/ExploreV2/screens/UniversalSearch";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import React from "react";
import { Keyboard } from "react-native";
import useStore from "stores/useStore";
import { renderComponent } from "tests/helpers/render";

const initialStoreState = useStore.getState( );

const mockNavigate = jest.fn( );
const mockPopTo = jest.fn( );
jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      navigate: mockNavigate,
      popTo: mockPopTo,
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

jest.mock( "sharedHelpers/fetchCoarseUserLocation", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
const fetchCoarseUserLocation = require( "sharedHelpers/fetchCoarseUserLocation" ).default;

jest.mock( "sharedHelpers/geolocationWrapper", ( ) => {
  const actual = jest.requireActual( "sharedHelpers/geolocationWrapper" );
  return {
    ...actual,
    checkLocationPermissions: jest.fn( ),
  };
} );
const { checkLocationPermissions } = require( "sharedHelpers/geolocationWrapper" );

const mockRequestLocationPermissions = jest.fn( );

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

const PLACE_RESULTS = [
  {
    type: "place", id: 1, display_name: "Monterey, CA, US", place_type: 9,
  },
  {
    type: "place", id: 2, display_name: "Montenegro", place_type: 12,
  },
];

const actor = userEvent.setup( );

const typeQuery = text => {
  fireEvent.changeText( screen.getByTestId( "UniversalSearch.subjectInput" ), text );
  // The debounce timing is exercised directly with fake timers, so we keep
  // fireEvent + manual advancement here rather than userEvent.type.
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

const focusLocation = ( ) => {
  fireEvent( screen.getByTestId( "UniversalSearch.locationInput" ), "focus" );
};

beforeAll( async ( ) => {
  await initI18next( );
} );

beforeEach( ( ) => {
  jest.useFakeTimers( );
  // Reset the real Zustand store so recent-location-search history doesn't leak.
  useStore.setState( initialStoreState, true );
  mockNavigate.mockClear( );
  mockPopTo.mockClear( );
  mockDispatch.mockClear( );
  mockRequestLocationPermissions.mockClear( );
  fetchCoarseUserLocation.mockReset( );
  // Default to location permission granted; the no-permission case overrides this.
  checkLocationPermissions.mockReset( );
  checkLocationPermissions.mockResolvedValue( "granted" );
  useExploreV2.mockReturnValue( {
    dispatch: mockDispatch,
    state: {},
    requestLocationPermissions: mockRequestLocationPermissions,
  } );
  useCurrentUser.mockReturnValue( CURRENT_USER );
  useIconicTaxa.mockReturnValue( ICONIC_TAXA );
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

  it( "clears both fields when reset is pressed", async ( ) => {
    renderComponent( <UniversalSearch /> );

    fireEvent.changeText( screen.getByTestId( "UniversalSearch.subjectInput" ), "cup plant" );
    fireEvent.changeText( screen.getByTestId( "UniversalSearch.locationInput" ), "California" );

    await actor.press( screen.getByText( i18next.t( "Reset-verb" ) ) );

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

  it( "fills the field but does not commit to context when a result is tapped", async ( ) => {
    useUniversalSearch.mockReturnValue( {
      results: MIXED_RESULTS,
      isLoading: false,
      refetch: jest.fn( ),
    } );
    renderComponent( <UniversalSearch /> );

    typeQuery( "ver" );

    await actor.press( screen.getByTestId( "UniversalSearchResult.user.7" ) );

    // the selection is staged locally, not written to context until Search
    expect( mockDispatch ).not.toHaveBeenCalled( );
    // the search field is filled with the selected suggestion
    expect( screen.getByDisplayValue( "seth_msp" ) ).toBeTruthy( );
  } );

  it(
    "clears the field but keeps the staged subject when refocusing after a selection",
    async ( ) => {
      useUniversalSearch.mockReturnValue( {
        results: MIXED_RESULTS,
        isLoading: false,
        refetch: jest.fn( ),
      } );
      renderComponent( <UniversalSearch /> );

      typeQuery( "ver" );
      await actor.press( screen.getByTestId( "UniversalSearchResult.user.7" ) );
      expect( screen.getByDisplayValue( "seth_msp" ) ).toBeTruthy( );

      fireEvent( screen.getByTestId( "UniversalSearch.subjectInput" ), "focus" );

      // the field is cleared for a fresh search...
      expect( screen.queryByDisplayValue( "seth_msp" ) ).toBeNull( );

      await actor.press( screen.getByTestId( "UniversalSearch.searchButton" ) );
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
    },
  );

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

  describe( "default search options (empty subject field)", ( ) => {
    it( "shows the iconic taxa chooser, current user, and unobserved shortcut", ( ) => {
      renderComponent( <UniversalSearch /> );

      expect( screen.getByTestId( "DefaultSearchOptions" ) ).toBeTruthy( );
      expect( screen.getByTestId( "INatIconButton.IconicTaxonButton.plantae" ) ).toBeTruthy( );
      // current user's profile row, identified by their login
      expect( screen.getByText( "tester" ) ).toBeTruthy( );
      // "Species I haven't observed" shortcut
      expect( screen.getByText( i18next.t( "Species-I-havent-observed" ) ) ).toBeTruthy( );
    } );

    it( "fills the field and stages the subject when an iconic taxon is tapped", async ( ) => {
      renderComponent( <UniversalSearch /> );

      await actor.press( screen.getByTestId( "INatIconButton.IconicTaxonButton.plantae" ) );

      // the selection is staged locally, not written to context until Search
      expect( mockDispatch ).not.toHaveBeenCalled( );
      // common name is primary for the test user, so the field shows "Plants"
      expect( screen.getByDisplayValue( "Plants" ) ).toBeTruthy( );

      await actor.press( screen.getByTestId( "UniversalSearch.searchButton" ) );
      expect( mockDispatch ).toHaveBeenCalledWith(
        expect.objectContaining( {
          type: "SET_SUBJECT",
          subject: expect.objectContaining( {
            type: "taxon",
            taxon: expect.objectContaining( { id: 47126, name: "Plantae" } ),
          } ),
        } ),
      );
    } );

    it( "stages the current user as the subject when their profile row is tapped", async ( ) => {
      renderComponent( <UniversalSearch /> );

      await actor.press( screen.getByTestId( "UniversalSearchResult.user.99" ) );

      // the selection is staged locally, not written to context until Search
      expect( mockDispatch ).not.toHaveBeenCalled( );
      expect( screen.getByDisplayValue( "tester" ) ).toBeTruthy( );

      await actor.press( screen.getByTestId( "UniversalSearch.searchButton" ) );
      expect( mockDispatch ).toHaveBeenCalledWith(
        expect.objectContaining( {
          type: "SET_SUBJECT",
          subject: expect.objectContaining( {
            type: "user",
            user: expect.objectContaining( { id: 99, login: "tester" } ),
          } ),
        } ),
      );
    } );

    it( "hides the current user row when logged out", ( ) => {
      useCurrentUser.mockReturnValue( null );
      renderComponent( <UniversalSearch /> );

      expect( screen.queryByTestId( "UniversalSearchResult.user.99" ) ).toBeNull( );
      // the iconic taxa chooser still renders, but the unobserved shortcut does not
      expect( screen.getByTestId( "INatIconButton.IconicTaxonButton.plantae" ) ).toBeTruthy( );
      expect( screen.queryByText( i18next.t( "Species-I-havent-observed" ) ) ).toBeNull( );
    } );

    it( "hides the default options once a subject query is entered", ( ) => {
      renderComponent( <UniversalSearch /> );

      expect( screen.getByTestId( "DefaultSearchOptions" ) ).toBeTruthy( );

      typeQuery( "ver" );

      expect( screen.queryByTestId( "DefaultSearchOptions" ) ).toBeNull( );
    } );
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

  it(
    "fills the field and dismisses the keyboard on place selection, without committing",
    async ( ) => {
      const dismissSpy = jest.spyOn( Keyboard, "dismiss" ).mockImplementation( ( ) => {} );
      useLocationSearch.mockReturnValue( {
        results: PLACE_RESULTS,
        isLoading: false,
        refetch: jest.fn( ),
      } );
      renderComponent( <UniversalSearch /> );

      typeLocationQuery( "mon" );
      await actor.press( screen.getByTestId( "LocationSearchResult.1" ) );

      // the location field is filled with the selected place
      expect( screen.getByDisplayValue( "Monterey, CA, US" ) ).toBeTruthy( );
      expect( dismissSpy ).toHaveBeenCalled( );

      dismissSpy.mockRestore( );
    },
  );

  describe( "default location options (empty location field)", ( ) => {
    it( "shows the Nearby and Worldwide rows when the location field is focused", ( ) => {
      renderComponent( <UniversalSearch /> );

      // Subject is the initial field, so its defaults show first.
      expect( screen.queryByTestId( "LocationDefaultOptions" ) ).toBeNull( );

      focusLocation( );

      expect( screen.getByTestId( "LocationDefaultOptions" ) ).toBeTruthy( );
      expect( screen.getByRole( "button", { name: i18next.t( "Nearby" ) } ) ).toBeTruthy( );
      expect( screen.getByRole( "button", { name: i18next.t( "Worldwide" ) } ) ).toBeTruthy( );
    } );

    it( "hides the location defaults once a location query is entered", ( ) => {
      renderComponent( <UniversalSearch /> );

      focusLocation( );
      expect( screen.getByTestId( "LocationDefaultOptions" ) ).toBeTruthy( );

      typeLocationQuery( "mon" );

      expect( screen.queryByTestId( "LocationDefaultOptions" ) ).toBeNull( );
    } );

    it( "hides the defaults after a selection and restores them on re-focus", async ( ) => {
      renderComponent( <UniversalSearch /> );

      focusLocation( );
      await actor.press( screen.getByRole( "button", { name: i18next.t( "Worldwide" ) } ) );

      await waitFor( ( ) => {
        expect( screen.getByDisplayValue( i18next.t( "Worldwide" ) ) ).toBeTruthy( );
      } );
      expect( screen.queryByTestId( "LocationDefaultOptions" ) ).toBeNull( );

      focusLocation( );
      expect( screen.getByTestId( "LocationDefaultOptions" ) ).toBeTruthy( );
    } );

    it( "fills the field and stages worldwide when Worldwide is tapped", async ( ) => {
      renderComponent( <UniversalSearch /> );

      focusLocation( );
      await actor.press( screen.getByRole( "button", { name: i18next.t( "Worldwide" ) } ) );

      expect( mockDispatch ).not.toHaveBeenCalled( );
      expect( screen.getByDisplayValue( i18next.t( "Worldwide" ) ) ).toBeTruthy( );

      await actor.press( screen.getByTestId( "UniversalSearch.searchButton" ) );
      expect( mockDispatch ).toHaveBeenCalledWith( { type: "SET_LOCATION_WORLDWIDE" } );
    } );

    it( "fills the field and stages nearby when Nearby is tapped", async ( ) => {
      fetchCoarseUserLocation.mockResolvedValue( { latitude: 10, longitude: 20 } );
      renderComponent( <UniversalSearch /> );

      focusLocation( );
      await actor.press( screen.getByRole( "button", { name: i18next.t( "Nearby" ) } ) );

      await waitFor( ( ) => {
        expect( screen.getByDisplayValue( i18next.t( "Nearby" ) ) ).toBeTruthy( );
      } );
      expect( mockDispatch ).not.toHaveBeenCalled( );

      await actor.press( screen.getByTestId( "UniversalSearch.searchButton" ) );
      expect( mockDispatch ).toHaveBeenCalledWith( {
        type: "SET_LOCATION_NEARBY",
        lat: 10,
        lng: 20,
        radius: 1,
      } );
    } );

    it(
      "stages worldwide when permission is granted but no location fix is available",
      async ( ) => {
        fetchCoarseUserLocation.mockResolvedValue( null );
        checkLocationPermissions.mockResolvedValue( "granted" );
        renderComponent( <UniversalSearch /> );

        focusLocation( );
        await actor.press( screen.getByRole( "button", { name: i18next.t( "Nearby" ) } ) );
        await waitFor( ( ) => {
          expect( screen.getByDisplayValue( i18next.t( "Nearby" ) ) ).toBeTruthy( );
        } );
        expect( mockDispatch ).not.toHaveBeenCalled( );

        await actor.press( screen.getByTestId( "UniversalSearch.searchButton" ) );
        expect( mockDispatch ).toHaveBeenCalledWith( { type: "SET_LOCATION_WORLDWIDE" } );
        expect( mockDispatch ).not.toHaveBeenCalledWith(
          { type: "SET_LOCATION_NEEDS_PERMISSION" },
        );
      },
    );

    it(
      "stages nearby-needs-permission (without prompting) when permission is missing",
      async ( ) => {
        fetchCoarseUserLocation.mockResolvedValue( null );
        checkLocationPermissions.mockResolvedValue( null );
        renderComponent( <UniversalSearch /> );

        focusLocation( );
        await actor.press( screen.getByRole( "button", { name: i18next.t( "Nearby" ) } ) );

        await waitFor( ( ) => {
          expect( screen.getByDisplayValue( i18next.t( "Nearby" ) ) ).toBeTruthy( );
        } );

        expect( mockRequestLocationPermissions ).not.toHaveBeenCalled( );
        expect( mockDispatch ).not.toHaveBeenCalled( );

        await actor.press( screen.getByTestId( "UniversalSearch.searchButton" ) );
        expect( mockDispatch ).toHaveBeenCalledWith( { type: "SET_LOCATION_NEEDS_PERMISSION" } );
      },
    );

    it( "shows persisted recent searches below Nearby/Worldwide", ( ) => {
      useStore.setState( {
        recentLocationSearches: [{ id: 5, display_name: "Big Sur, CA, US" }],
      } );
      renderComponent( <UniversalSearch /> );

      focusLocation( );

      expect( screen.getByText( "Big Sur, CA, US" ) ).toBeTruthy( );
      expect( screen.getByText( i18next.t( "Recent-Search" ) ) ).toBeTruthy( );
    } );

    it( "stages a recent search as the place when its row is tapped", async ( ) => {
      const recent = { id: 5, display_name: "Big Sur, CA, US" };
      useStore.setState( { recentLocationSearches: [recent] } );
      renderComponent( <UniversalSearch /> );

      focusLocation( );
      await actor.press( screen.getByTestId( "LocationSearchResult.5" ) );

      expect( mockDispatch ).not.toHaveBeenCalled( );
      expect( screen.getByDisplayValue( "Big Sur, CA, US" ) ).toBeTruthy( );

      await actor.press( screen.getByTestId( "UniversalSearch.searchButton" ) );
      expect( mockDispatch ).toHaveBeenCalledWith( {
        type: "SET_LOCATION_PLACE",
        place: recent,
      } );
    } );
  } );

  it( "navigates to Advanced Search", async ( ) => {
    renderComponent( <UniversalSearch /> );

    await actor.press( screen.getByText( i18next.t( "Advanced-Search" ) ) );

    expect( mockNavigate ).toHaveBeenCalledWith( "AdvancedSearch" );
  } );

  describe( "search submission", ( ) => {
    const selectSubject = async ( ) => {
      useUniversalSearch.mockReturnValue( {
        results: MIXED_RESULTS,
        isLoading: false,
        refetch: jest.fn( ),
      } );
      typeQuery( "ver" );
      await actor.press( screen.getByTestId( "UniversalSearchResult.user.7" ) );
    };

    // Stage a location pick on this instance of the screen.
    const selectPlace = async ( ) => {
      useLocationSearch.mockReturnValue( {
        results: PLACE_RESULTS,
        isLoading: false,
        refetch: jest.fn( ),
      } );
      typeLocationQuery( "mon" );
      await actor.press( screen.getByTestId( "LocationSearchResult.1" ) );
    };

    const pressSearch = ( ) => actor.press(
      screen.getByTestId( "UniversalSearch.searchButton" ),
    );

    it( "navigates to ExploreResults when the search button is pressed", async ( ) => {
      renderComponent( <UniversalSearch /> );

      await pressSearch( );

      expect( mockPopTo ).toHaveBeenCalledWith( "ExploreResults" );
    } );

    it( "commits all organisms + worldwide when nothing is selected", async ( ) => {
      renderComponent( <UniversalSearch /> );

      await pressSearch( );

      expect( mockDispatch ).toHaveBeenCalledWith( { type: "CLEAR_SUBJECT" } );
      expect( mockDispatch ).toHaveBeenCalledWith( { type: "SET_LOCATION_WORLDWIDE" } );
    } );

    it( "commits the subject + worldwide when only a subject is selected", async ( ) => {
      renderComponent( <UniversalSearch /> );

      await selectSubject( );
      await pressSearch( );

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

    it( "commits all organisms + the place when only a location is selected", async ( ) => {
      renderComponent( <UniversalSearch /> );

      await selectPlace( );
      await pressSearch( );

      // subject was left untouched → all organisms
      expect( mockDispatch ).toHaveBeenCalledWith( { type: "CLEAR_SUBJECT" } );
      expect( mockDispatch ).toHaveBeenCalledWith( {
        type: "SET_LOCATION_PLACE",
        place: { id: 1, display_name: "Monterey, CA, US" },
      } );
    } );

    it( "commits both when a subject and a location are selected", async ( ) => {
      renderComponent( <UniversalSearch /> );

      await selectSubject( );
      await selectPlace( );
      await pressSearch( );

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

    it( "does not commit anything after Reset clears the staged selections", async ( ) => {
      renderComponent( <UniversalSearch /> );

      await selectSubject( );
      await selectPlace( );
      await actor.press( screen.getByText( i18next.t( "Reset-verb" ) ) );

      await pressSearch( );

      // Reset cleared the staged picks, so Search falls back to the defaults.
      expect( mockDispatch ).toHaveBeenCalledWith( { type: "CLEAR_SUBJECT" } );
      expect( mockDispatch ).toHaveBeenCalledWith( { type: "SET_LOCATION_WORLDWIDE" } );
    } );

    it( "records the selected place in recent searches on search", async ( ) => {
      renderComponent( <UniversalSearch /> );

      await selectPlace( );
      await pressSearch( );

      expect( useStore.getState( ).recentLocationSearches ).toEqual( [
        { id: 1, display_name: "Monterey, CA, US" },
      ] );
    } );

    it( "does not record recent searches for a worldwide search", async ( ) => {
      renderComponent( <UniversalSearch /> );

      await pressSearch( );

      expect( useStore.getState( ).recentLocationSearches ).toEqual( [] );
    } );

    it( "dismisses the keyboard when the search button is pressed", async ( ) => {
      const dismissSpy = jest.spyOn( Keyboard, "dismiss" ).mockImplementation( ( ) => {} );
      renderComponent( <UniversalSearch /> );

      await pressSearch( );

      expect( dismissSpy ).toHaveBeenCalled( );

      dismissSpy.mockRestore( );
    } );
  } );
} );
