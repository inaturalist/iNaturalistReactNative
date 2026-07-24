import { screen, userEvent, waitFor } from "@testing-library/react-native";
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
import { renderComponent } from "tests/helpers/render";

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
