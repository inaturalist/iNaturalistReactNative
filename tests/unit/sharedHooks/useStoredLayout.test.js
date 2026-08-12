import { renderHook, waitFor } from "@testing-library/react-native";
import useStoredLayout from "sharedHooks/useStoredLayout";
import { zustandStorage } from "stores/useStore";

const EXPLORE_V2_KEY = "exploreV2ObservationsLayout";
const MY_OBS_KEY = "myObservationsLayout";

const renderStoredLayout = storageKey => renderHook(
  ( ) => useStoredLayout( storageKey ),
);

afterEach( ( ) => {
  zustandStorage.removeItem( EXPLORE_V2_KEY );
  zustandStorage.removeItem( MY_OBS_KEY );
} );

describe( "useStoredLayout", ( ) => {
  it( "defaults Explore to the map view", async ( ) => {
    const { result } = renderStoredLayout( EXPLORE_V2_KEY );

    await waitFor( ( ) => expect( result.current.layout ).toBe( "map" ) );
  } );

  it( "defaults other screens to the grid view", async ( ) => {
    const { result } = renderStoredLayout( MY_OBS_KEY );

    await waitFor( ( ) => expect( result.current.layout ).toBe( "grid" ) );
  } );

  it( "prefers a stored layout over the default", async ( ) => {
    zustandStorage.setItem( EXPLORE_V2_KEY, "list" );

    const { result } = renderStoredLayout( EXPLORE_V2_KEY );

    await waitFor( ( ) => expect( result.current.layout ).toBe( "list" ) );
  } );

  it( "persists a newly selected layout", async ( ) => {
    const { result } = renderStoredLayout( EXPLORE_V2_KEY );
    await waitFor( ( ) => expect( result.current.layout ).toBe( "map" ) );

    result.current.writeLayoutToStorage( "grid" );

    await waitFor( ( ) => expect( result.current.layout ).toBe( "grid" ) );
    expect( zustandStorage.getItem( EXPLORE_V2_KEY ) ).toBe( "grid" );
  } );
} );
