import { faker } from "@faker-js/faker";
import { renderHook } from "@testing-library/react-native";
import { fetchTaxon } from "api/taxa";
import { useAuthenticatedQuery, useTaxon } from "sharedHooks";

import factory from "../../factory";

jest.mock( "sharedHooks/useAuthenticatedQuery" );
jest.mock( "api/taxa" );

const mockTaxonPrediction = {
  id: 144351,
  name: "Poecile",
  rank_level: 20
};

const mockTaxon = factory( "LocalTaxon", {
  default_photo: {
    url: faker.image.imageUrl( )
  }
} );
const mockRemoteTaxon = factory( "RemoteTaxon" );

const mockRealm = {
  objectForPrimaryKey: jest.fn( ).mockReturnValue( mockTaxon ),
  write: jest.fn( )
};
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => mockRealm
    }
  };
} );

describe( "useTaxon", ( ) => {
  beforeEach( ( ) => {
    useAuthenticatedQuery.mockReturnValue( { data: mockRemoteTaxon } );
  } );

  afterEach( () => {
    // Clear mocks after each test to handle different cases of realm.write being called or not
    jest.clearAllMocks();
  } );

  it( "should return an object", ( ) => {
    const { result } = renderHook( ( ) => useTaxon( mockTaxonPrediction ) );
    expect( result.current ).toBeInstanceOf( Object );
  } );

  it( "should call disabled useAuthenticatedQuery when no taxon id", ( ) => {
    renderHook( ( ) => useTaxon( {
      id: null
    } ) );
    expect( useAuthenticatedQuery ).toHaveBeenCalledWith(
      [fetchTaxon],
      expect.any( Function ),
      { enabled: false }
    );
  } );

  it( "should call enabled useAuthenticatedQuery when taxon id exists", ( ) => {
    renderHook( ( ) => useTaxon( mockTaxonPrediction ) );
    expect( useAuthenticatedQuery ).toHaveBeenCalledWith(
      [fetchTaxon],
      expect.any( Function ),
      { enabled: true }
    );
  } );

  describe( "when there is no local taxon with taxon id", ( ) => {
    beforeEach( ( ) => {
      mockRealm.objectForPrimaryKey.mockReturnValue( null );
    } );

    afterEach( () => {
      mockRealm.objectForPrimaryKey.mockReturnValue( mockTaxon );
    } );

    it( "should call realm.write", ( ) => {
      renderHook( ( ) => useTaxon( mockTaxonPrediction ) );
      expect( mockRealm.write ).toHaveBeenCalled( );
    } );
  } );

  describe( "when there is a local taxon with taxon id", ( ) => {
    it( "should return local taxon", ( ) => {
      const { result } = renderHook( ( ) => useTaxon( mockTaxonPrediction ) );
      expect( result.current ).toHaveProperty( "default_photo" );
    } );
  } );
} );
