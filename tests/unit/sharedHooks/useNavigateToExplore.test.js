import { act, renderHook } from "@testing-library/react-native";
import { OBSERVATIONS_TAB, SPECIES_TAB } from "appConstants/tabs";
import { EXPLORE_PLACE_MODE } from "providers/ExploreContext";
import useNavigateToExplore from "sharedHooks/useNavigateToExplore";
import { zustandStorage } from "stores/useStore";

const LAYOUT_KEY = "exploreV2ObservationsLayout";

const mockNavigate = jest.fn( );
jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( { navigate: mockNavigate } ),
  };
} );

const taxon = { id: 12345, name: "Danaus plexippus" };
const user = { id: 99, login: "birder" };
const project = { id: 7, title: "City Nature Challenge" };
const place = { id: 55, display_name: "Oakland, CA" };

const navigateToExplore = options => {
  const { result } = renderHook( ( ) => useNavigateToExplore( ) );
  act( ( ) => result.current( options ) );
};

beforeEach( ( ) => {
  mockNavigate.mockClear( );
  zustandStorage.removeItem( LAYOUT_KEY );
} );

describe( "useNavigateToExplore", ( ) => {
  it( "opens a taxon worldwide on the observations tab by default", ( ) => {
    navigateToExplore( { taxon } );

    expect( mockNavigate ).toHaveBeenCalledWith( "Explore", {
      subject: { type: "taxon", taxon: { id: taxon.id, name: taxon.name } },
      location: { placeMode: EXPLORE_PLACE_MODE.WORLDWIDE },
      activeTab: OBSERVATIONS_TAB,
    } );
  } );

  it( "opens a user on the requested tab", ( ) => {
    navigateToExplore( {
      user: { ...user, icon_url: "https://example.com/icon.jpg" },
      tab: SPECIES_TAB,
    } );

    expect( mockNavigate ).toHaveBeenCalledWith( "Explore", expect.objectContaining( {
      subject: {
        type: "user",
        user: { id: user.id, login: user.login, icon_url: "https://example.com/icon.jpg" },
      },
      activeTab: SPECIES_TAB,
    } ) );
  } );

  it( "omits the subject for a record Explore can't query, e.g. one with no id", ( ) => {
    navigateToExplore( { taxon: { name: "Aves" }, place } );

    expect( mockNavigate ).toHaveBeenCalledWith( "Explore", {
      location: { placeMode: EXPLORE_PLACE_MODE.PLACE, place },
      activeTab: OBSERVATIONS_TAB,
    } );
  } );

  it( "falls back to worldwide for a place with no id", ( ) => {
    navigateToExplore( { taxon, place: { display_name: "Somewhere" } } );

    expect( mockNavigate ).toHaveBeenCalledWith( "Explore", expect.objectContaining( {
      location: { placeMode: EXPLORE_PLACE_MODE.WORLDWIDE },
    } ) );
  } );

  it( "narrows to a place when given one", ( ) => {
    navigateToExplore( {
      project: { ...project, icon: "https://example.com/project.png" },
      place,
    } );

    expect( mockNavigate ).toHaveBeenCalledWith( "Explore", expect.objectContaining( {
      subject: {
        type: "project",
        project: {
          id: project.id,
          title: project.title,
          icon: "https://example.com/project.png",
        },
      },
      location: { placeMode: EXPLORE_PLACE_MODE.PLACE, place },
    } ) );
  } );

  it( "stores a requested layout", ( ) => {
    navigateToExplore( { taxon, layout: "map" } );

    expect( zustandStorage.getItem( LAYOUT_KEY ) ).toBe( "map" );
  } );

  it( "leaves the stored layout alone when none is requested", ( ) => {
    navigateToExplore( { taxon, tab: SPECIES_TAB } );

    expect( zustandStorage.getItem( LAYOUT_KEY ) ).toBeNull( );
  } );
} );
