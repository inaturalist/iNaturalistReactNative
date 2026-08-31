import { refresh, useNetInfo } from "@react-native-community/netinfo";
import {
  act, screen, userEvent, waitFor,
} from "@testing-library/react-native";
import { SPECIES_TAB } from "appConstants/tabs";
import ExploreResults from "components/Explore/ExploreV2/screens/ExploreResults";
import initI18next from "i18n/initI18next";
import {
  EXPLORE_V2_ACTION,
  EXPLORE_V2_PLACE_MODE,
  initialExploreV2State,
} from "providers/ExploreV2Context";
import React from "react";
import { SPECIES_SORT } from "sharedHelpers/speciesSort";
import { SAVED_LIMIT } from "stores/createExploreV2SearchesSlice";
import useStore from "stores/useStore";
import { renderComponent } from "tests/helpers/render";
import { savedSearch, setSavedSearches, taxonSubject } from "tests/helpers/savedSearch";

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useFocusEffect: cb => jest.requireActual( "react" ).useEffect( cb, [] ),
  };
} );

jest.mock( "providers/ExploreV2Context", ( ) => {
  const actual = jest.requireActual( "providers/ExploreV2Context" );
  return { ...actual, useExploreV2: jest.fn( ) };
} );
const { useExploreV2 } = require( "providers/ExploreV2Context" );

let mockHasPermissions;
let mockHasBlockedPermissions;
const mockDispatch = jest.fn( );
const mockRequestPermissions = jest.fn( );
jest.mock( "sharedHooks/useLocationPermission", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    hasPermissions: mockHasPermissions,
    hasBlockedPermissions: mockHasBlockedPermissions,
    renderPermissionsGate: ( ) => null,
    requestPermissions: mockRequestPermissions,
  } ),
} ) );

jest.mock( "sharedHelpers/fetchCoarseUserLocation", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
const fetchCoarseUserLocation = require( "sharedHelpers/fetchCoarseUserLocation" ).default;

const mockUseInfiniteExploreScroll = jest.fn( );
jest.mock( "components/Explore/hooks/useInfiniteExploreScroll", ( ) => ( {
  __esModule: true,
  default: args => mockUseInfiniteExploreScroll( args ),
} ) );

jest.mock( "sharedHooks/useSpeciesCount", ( ) => ( { __esModule: true, default: ( ) => 0 } ) );

const mockExploreV2SpeciesView = jest.fn( ( ) => null );
jest.mock( "components/Explore/ExploreV2/screens/ExploreV2SpeciesView", ( ) => ( {
  __esModule: true,
  default: props => mockExploreV2SpeciesView( props ),
} ) );

let mockLayout = "map";
const mockWriteLayoutToStorage = jest.fn( );
jest.mock( "sharedHooks/useStoredLayout", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    layout: mockLayout,
    writeLayoutToStorage: mockWriteLayoutToStorage,
  } ),
} ) );

const mockState = location => ( {
  ...initialExploreV2State,
  location,
} );

const lastScrollArgs = ( ) => mockUseInfiniteExploreScroll.mock.calls.at( -1 )[0];

beforeAll( async ( ) => {
  await initI18next( );
} );

beforeEach( ( ) => {
  mockHasPermissions = undefined;
  mockHasBlockedPermissions = false;
  mockLayout = "map";
  mockWriteLayoutToStorage.mockClear( );
  mockDispatch.mockClear( );
  mockRequestPermissions.mockClear( );
  mockExploreV2SpeciesView.mockClear( );
  fetchCoarseUserLocation.mockReset( );
  mockUseInfiniteExploreScroll.mockReset( );
  mockUseInfiniteExploreScroll.mockReturnValue( {
    fetchNextPage: jest.fn( ),
    isFetchingNextPage: false,
    handlePullToRefresh: jest.fn( ),
    observations: [],
    totalResults: 0,
  } );
} );

describe( "ExploreResults nearby resolution", ( ) => {
  it( "includes fetched coordinates in the query when nearby with permission", async ( ) => {
    mockHasPermissions = true;
    fetchCoarseUserLocation.mockResolvedValueOnce( { latitude: 37.5, longitude: -122.1 } );
    useExploreV2.mockReturnValue( {
      state: mockState( { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY } ),
      dispatch: mockDispatch,
    } );

    renderComponent( <ExploreResults /> );

    await waitFor( ( ) => {
      const { params, enabled } = lastScrollArgs( );
      expect( params.lat ).toBe( 37.5 );
      expect( params.lng ).toBe( -122.1 );
      expect( params.radius ).toBe( 1 );
      expect( enabled ).toBe( true );
    } );
  } );

  it( "shows the permission prompt and does not fetch when nearby, no permission", async ( ) => {
    mockHasPermissions = false;
    useExploreV2.mockReturnValue( {
      state: mockState( { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY } ),
      dispatch: mockDispatch,
    } );

    renderComponent( <ExploreResults /> );

    expect(
      await screen.findByText( /To view nearby organisms/ ),
    ).toBeVisible( );
    expect( fetchCoarseUserLocation ).not.toHaveBeenCalled( );
    expect( lastScrollArgs( ).enabled ).toBe( false );
  } );

  it( "does not show stale counts in the tabs when nearby, no permission", async ( ) => {
    // Simulate the shared query cache still holding the previous (worldwide)
    // result: the disabled query returns a non-zero totalResults.
    mockUseInfiniteExploreScroll.mockReturnValue( {
      fetchNextPage: jest.fn( ),
      isFetchingNextPage: false,
      handlePullToRefresh: jest.fn( ),
      observations: [],
      totalResults: 42,
    } );
    mockHasPermissions = false;
    useExploreV2.mockReturnValue( {
      state: mockState( { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY } ),
      dispatch: mockDispatch,
    } );

    renderComponent( <ExploreResults /> );

    expect(
      await screen.findByText( /To view nearby organisms/ ),
    ).toBeVisible( );
    // The stale worldwide count must not leak into the tabs.
    expect( screen.queryByText( "42" ) ).toBeNull( );
    expect( screen.getAllByText( "--" ).length ).toBeGreaterThanOrEqual( 1 );
  } );

  it( "dispatches worldwide without prompting when permission is blocked", async ( ) => {
    mockHasPermissions = false;
    mockHasBlockedPermissions = true;
    useExploreV2.mockReturnValue( {
      state: mockState( { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY } ),
      dispatch: mockDispatch,
    } );

    renderComponent( <ExploreResults /> );

    await waitFor( ( ) => expect( mockDispatch ).toHaveBeenCalledWith( {
      type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE,
    } ) );
    expect( screen.queryByText( /To view nearby organisms/ ) ).toBeNull( );
    expect( fetchCoarseUserLocation ).not.toHaveBeenCalled( );
  } );

  it( "dispatches worldwide when permission is granted but there is no fix", async ( ) => {
    mockHasPermissions = true;
    fetchCoarseUserLocation.mockResolvedValueOnce( null );
    useExploreV2.mockReturnValue( {
      state: mockState( { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY } ),
      dispatch: mockDispatch,
    } );

    renderComponent( <ExploreResults /> );

    await waitFor( ( ) => expect( mockDispatch ).toHaveBeenCalledWith( {
      type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE,
    } ) );
  } );

  it( "fetches worldwide without coordinates when worldwide", async ( ) => {
    mockHasPermissions = true;
    useExploreV2.mockReturnValue( {
      state: mockState( { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE } ),
      dispatch: mockDispatch,
    } );

    renderComponent( <ExploreResults /> );

    await waitFor( ( ) => expect( lastScrollArgs( ).enabled ).toBe( true ) );
    expect( lastScrollArgs( ).params.lat ).toBeUndefined( );
    expect( fetchCoarseUserLocation ).not.toHaveBeenCalled( );
  } );
} );

describe( "ExploreResults offline state", ( ) => {
  const mockHandlePullToRefresh = jest.fn( );

  beforeEach( ( ) => {
    refresh.mockClear( );
    mockHandlePullToRefresh.mockClear( );
    useNetInfo.mockReturnValue( { isConnected: false } );
    mockUseInfiniteExploreScroll.mockReturnValue( {
      fetchNextPage: jest.fn( ),
      isFetchingNextPage: false,
      handlePullToRefresh: mockHandlePullToRefresh,
      observations: [],
      totalResults: 0,
    } );
    mockHasPermissions = true;
    useExploreV2.mockReturnValue( {
      state: mockState( { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE } ),
      dispatch: mockDispatch,
    } );
  } );

  afterEach( ( ) => {
    useNetInfo.mockReturnValue( { isConnected: true } );
    refresh.mockResolvedValue( { isConnected: true } );
  } );

  it.each( ["map", "grid"] )(
    "shows the offline notice instead of the results in %s view when disconnected",
    async layout => {
      mockLayout = layout;
      renderComponent( <ExploreResults /> );

      expect(
        await screen.findByText( "You are offline. Tap to try again." ),
      ).toBeVisible( );
      expect( screen.queryByTestId( "ExploreV2ObservationsList" ) ).toBeNull( );
      expect( screen.queryByTestId( "Map.MapView" ) ).toBeNull( );
    },
  );

  it( "retries the search when the offline notice is tapped and we are back online", async ( ) => {
    refresh.mockResolvedValue( { isConnected: true } );
    const actor = userEvent.setup( );
    renderComponent( <ExploreResults /> );

    const offlineNotice = await screen.findByLabelText( "Internet Connection Required" );
    await actor.press( offlineNotice );

    expect( refresh ).toHaveBeenCalled( );
    await waitFor( ( ) => expect( mockHandlePullToRefresh ).toHaveBeenCalled( ) );
  } );
} );

describe( "ExploreResults species sort", ( ) => {
  const speciesTabState = {
    ...mockState( { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE } ),
    activeTab: SPECIES_TAB,
  };

  const lastSpeciesViewProps = ( ) => mockExploreV2SpeciesView.mock.calls.at( -1 )[0];

  it( "passes default most-observed sort params to the species view", async ( ) => {
    useExploreV2.mockReturnValue( { state: speciesTabState, dispatch: mockDispatch } );

    renderComponent( <ExploreResults /> );

    await waitFor( ( ) => {
      const { params } = lastSpeciesViewProps( );
      expect( params.order_by ).toBe( "count" );
      expect( params.order ).toBe( "desc" );
    } );
    expect( screen.getByLabelText( "Change species sort order" ) ).toBeVisible( );
  } );

  it( "passes ascending order to the species view when least observed is selected", async ( ) => {
    useExploreV2.mockReturnValue( {
      state: { ...speciesTabState, speciesSortBy: SPECIES_SORT.COUNT_ASC },
      dispatch: mockDispatch,
    } );

    renderComponent( <ExploreResults /> );

    await waitFor( ( ) => {
      const { params } = lastSpeciesViewProps( );
      expect( params.order_by ).toBe( "count" );
      expect( params.order ).toBe( "asc" );
    } );
  } );

  it( "dispatches SET_SPECIES_SORT when a new sort is confirmed in the sheet", async ( ) => {
    const actor = userEvent.setup( );
    useExploreV2.mockReturnValue( { state: speciesTabState, dispatch: mockDispatch } );

    renderComponent( <ExploreResults /> );

    await actor.press( await screen.findByLabelText( "Change species sort order" ) );
    expect( await screen.findByText( "SORT SPECIES" ) ).toBeVisible( );

    await actor.press( screen.getByText( "Least Observed" ) );
    await actor.press( screen.getByText( "CONFIRM" ) );

    expect( mockDispatch ).toHaveBeenCalledWith( {
      type: EXPLORE_V2_ACTION.SET_SPECIES_SORT,
      speciesSortBy: SPECIES_SORT.COUNT_ASC,
    } );
  } );
} );

describe( "ExploreResults observations view", ( ) => {
  beforeEach( ( ) => {
    mockHasPermissions = true;
    useExploreV2.mockReturnValue( {
      state: mockState( { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE } ),
      dispatch: mockDispatch,
    } );
  } );

  it( "offers map, grid, and list views", async ( ) => {
    renderComponent( <ExploreResults /> );

    expect( await screen.findByTestId( "SegmentedButton.map" ) ).toBeTruthy( );
    expect( screen.getByTestId( "SegmentedButton.grid" ) ).toBeTruthy( );
    expect( screen.getByTestId( "SegmentedButton.list" ) ).toBeTruthy( );
  } );

  it( "shows the map instead of the list in map view", async ( ) => {
    renderComponent( <ExploreResults /> );

    expect( await screen.findByTestId( "Map.MapView" ) ).toBeTruthy( );
    expect( screen.queryByTestId( "ExploreV2ObservationsList" ) ).toBeNull( );
  } );

  it( "shows the list instead of the map in grid view", async ( ) => {
    mockLayout = "grid";
    renderComponent( <ExploreResults /> );

    expect( await screen.findByTestId( "ExploreV2ObservationsList" ) ).toBeTruthy( );
    expect( screen.queryByTestId( "Map.MapView" ) ).toBeNull( );
  } );

  it( "persists the newly selected view when a view is tapped", async ( ) => {
    const actor = userEvent.setup( );
    renderComponent( <ExploreResults /> );

    await actor.press( await screen.findByTestId( "SegmentedButton.grid" ) );

    expect( mockWriteLayoutToStorage ).toHaveBeenCalledWith( "grid" );
  } );

  it( "hides the sort button in map view", async ( ) => {
    renderComponent( <ExploreResults /> );

    await screen.findByTestId( "Map.MapView" );
    expect( screen.queryByLabelText( "Change observations sort order" ) ).toBeNull( );
  } );

  it( "shows the sort button in grid view", async ( ) => {
    mockLayout = "grid";
    renderComponent( <ExploreResults /> );

    expect(
      await screen.findByLabelText( "Change observations sort order" ),
    ).toBeTruthy( );
  } );

  it( "makes the search nearby when the current location button is pressed", async ( ) => {
    const actor = userEvent.setup( );
    renderComponent( <ExploreResults /> );

    await actor.press( await screen.findByTestId( "Map.CurrentLocationButton" ) );

    expect( mockDispatch ).toHaveBeenCalledWith( {
      type: EXPLORE_V2_ACTION.SET_LOCATION_NEARBY,
    } );
  } );

  it(
    "shows the permission prompt instead of the map when nearby without permission",
    async ( ) => {
      mockHasPermissions = false;
      useExploreV2.mockReturnValue( {
        state: mockState( { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY } ),
        dispatch: mockDispatch,
      } );

      renderComponent( <ExploreResults /> );

      expect( await screen.findByText( /To view nearby organisms/ ) ).toBeVisible( );
      expect( screen.queryByTestId( "Map.MapView" ) ).toBeNull( );
      expect( screen.queryByTestId( "SegmentedButton.map" ) ).toBeNull( );
    },
  );

  it( "frames the map to the bounds of the results", async ( ) => {
    mockUseInfiniteExploreScroll.mockReturnValue( {
      fetchNextPage: jest.fn( ),
      isFetchingNextPage: false,
      handlePullToRefresh: jest.fn( ),
      observations: [],
      totalBounds: {
        swlat: 10, swlng: 20, nelat: 30, nelng: 40,
      },
      totalResults: 1,
    } );
    useExploreV2.mockReturnValue( {
      state: mockState( {
        placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
        place: { id: 1, display_name: "Berkeley" },
      } ),
      dispatch: mockDispatch,
    } );

    renderComponent( <ExploreResults /> );

    const map = await screen.findByTestId( "Map.MapView" );
    expect( map.props.initialRegion.latitude ).toBe( 20 );
    expect( map.props.initialRegion.longitude ).toBe( 30 );
  } );

  it( "searches the visible map area when redo search is pressed", async ( ) => {
    const actor = userEvent.setup( );
    renderComponent( <ExploreResults /> );

    const map = await screen.findByTestId( "Map.MapView" );
    await act( async ( ) => {
      map.props.onPanDrag( );
    } );
    await actor.press( screen.getByText( "REDO SEARCH IN MAP AREA" ) );

    expect( mockDispatch ).toHaveBeenCalledWith( {
      type: EXPLORE_V2_ACTION.SET_LOCATION_MAP_AREA,
      bounds: {
        swlat: 1, swlng: 2, nelat: 3, nelng: 4,
      },
    } );
  } );
} );

describe( "ExploreResults saved searches", ( ) => {
  const savedSearches = ( ) => useStore.getState( ).exploreSavedSearches;

  beforeEach( ( ) => {
    setSavedSearches( [] );
    useExploreV2.mockReturnValue( {
      state: mockState( { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE } ),
      dispatch: mockDispatch,
    } );
  } );

  it( "saves the current search when the star is tapped", async ( ) => {
    renderComponent( <ExploreResults /> );
    const actor = userEvent.setup( );

    await actor.press( await screen.findByLabelText( "Save this search" ) );

    expect( savedSearches( ).searches ).toHaveLength( 1 );
    expect( await screen.findByLabelText( "Remove this saved search" ) ).toBeVisible( );
  } );

  it( "unsaves it when the filled star is tapped", async ( ) => {
    renderComponent( <ExploreResults /> );
    const actor = userEvent.setup( );

    await actor.press( await screen.findByLabelText( "Save this search" ) );
    await actor.press( await screen.findByLabelText( "Remove this saved search" ) );

    expect( savedSearches( ).searches ).toEqual( [] );
    expect( await screen.findByLabelText( "Save this search" ) ).toBeVisible( );
  } );

  it( "explains the limit instead of saving when there is no room left", async ( ) => {
    setSavedSearches(
      Array.from( { length: SAVED_LIMIT } ).map(
        ( _item, i ) => savedSearch( { subject: taxonSubject( i ) } ),
      ),
    );

    renderComponent( <ExploreResults /> );
    const actor = userEvent.setup( );
    await actor.press( await screen.findByLabelText( "Save this search" ) );

    expect( await screen.findByText( /Remove one to save another/ ) ).toBeVisible( );
    expect( savedSearches( ).searches ).toHaveLength( SAVED_LIMIT );
  } );
} );
