import { renderHook } from "@testing-library/react-native";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useTaxonSearch from "sharedHooks/useTaxonSearch";
import factory from "tests/factory";

const mockIconicTaxa = [
  factory( "LocalTaxon" )
];

jest.mock( "sharedHooks/useIconicTaxa", ( ) => ( {
  __esModule: true,
  default: ( ) => mockIconicTaxa
} ) );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: jest.fn( () => ( {
    data: [],
    refetch: jest.mock( ),
    isLoading: false
  } ) )
} ) );

const mockSafeRealmWrite = jest.fn( );
jest.mock( "sharedHelpers/safeRealmWrite", ( ) => ( {
  __esModule: true,
  default: ( ) => mockSafeRealmWrite( )
} ) );

const mockRealmObjects = jest.fn( ( ) => ( {
  filtered: jest.fn( () => [] )
} ) );

jest.mock( "providers/contexts", ( ) => ( {
  __esModule: true,
  RealmContext: {
    useRealm: jest.fn( ( ) => ( {
      objects: mockRealmObjects
    } ) )
  }
} ) );

describe( "useTaxonSearch", ( ) => {
  afterEach( ( ) => {
    jest.clearAllMocks( );
  } );

  it( "should return iconic taxa by default", ( ) => {
    const { result } = renderHook( ( ) => useTaxonSearch( ) );
    const { taxa } = result.current;
    expect( taxa[0] ).toEqual( mockIconicTaxa[0] );
  } );

  it( "should request remote taxa with a query", ( ) => {
    const { data } = useAuthenticatedQuery( );
    expect( data.length ).toEqual( 0 );
    renderHook( ( ) => useTaxonSearch( "foo" ) );
    expect( useAuthenticatedQuery ).toHaveBeenCalledWith(
      expect.arrayContaining( ["fetchTaxonSuggestions"] ),
      expect.anything(),
      expect.objectContaining( { enabled: true } )
    );
  } );

  it( "should request local taxa with a query if no remote taxa", ( ) => {
    const { data } = useAuthenticatedQuery( );
    expect( data.length ).toEqual( 0 );
    renderHook( ( ) => useTaxonSearch( "foo" ) );
    expect( mockRealmObjects ).toHaveBeenCalledWith( "Taxon" );
  } );

  function mockRemoteTaxaAvailable( ) {
    useAuthenticatedQuery.mockImplementation( ( ) => ( {
      data: [factory( "LocalTaxon" )],
      refetch: jest.mock( ),
      isLoading: false
    } ) );
  }

  it( "should try to save remote taxa to Realm", ( ) => {
    mockRemoteTaxaAvailable( );
    renderHook( ( ) => useTaxonSearch( "foo" ) );
    expect( mockSafeRealmWrite ).toHaveBeenCalled( );
  } );

  it( "should not request local taxa if remote taxa exist", ( ) => {
    mockRemoteTaxaAvailable( );
    renderHook( ( ) => useTaxonSearch( "foo" ) );
    expect( mockRealmObjects ).not.toHaveBeenCalledWith( "Taxon" );
  } );
} );
