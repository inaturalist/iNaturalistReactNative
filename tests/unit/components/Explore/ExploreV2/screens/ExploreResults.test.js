import { screen, waitFor } from "@testing-library/react-native";
import ExploreResults from "components/Explore/ExploreV2/screens/ExploreResults";
import initI18next from "i18n/initI18next";
import {
  EXPLORE_V2_ACTION,
  EXPLORE_V2_PLACE_MODE,
  initialExploreV2State,
} from "providers/ExploreV2Context";
import React from "react";
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
