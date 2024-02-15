import { faker } from "@faker-js/faker";
import { renderHook } from "@testing-library/react-native";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useTaxon } from "sharedHooks";
import factory from "tests/factory";

const mockRemoteTaxon = factory( "RemoteTaxon", {
  default_photo: {
    url: faker.image.url( )
  }
} );

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockRemoteTaxon
  } )
} ) );

const mockTaxon = factory( "LocalTaxon", {
  default_photo: {
    url: faker.image.url( )
  }
} );

describe( "useTaxon", ( ) => {
  describe( "with local taxon", ( ) => {
    beforeEach( async ( ) => {
      // Write mock taxon to realm
      safeRealmWrite( global.realm, ( ) => {
        global.realm.create( "Taxon", mockTaxon, "modified" );
      }, "write mock taxon, useTaxon test" );
    } );

    it( "should return an object", ( ) => {
      const { result } = renderHook( ( ) => useTaxon( mockTaxon ) );
      expect( result.current ).toBeInstanceOf( Object );
    } );

    describe( "when there is a local taxon with taxon id", ( ) => {
      it( "should return local taxon with default photo", ( ) => {
        const { result } = renderHook( ( ) => useTaxon( mockTaxon ) );
        expect( result.current ).toHaveProperty( "default_photo" );
        expect( result.current.default_photo.url ).toEqual( mockTaxon.default_photo.url );
      } );
    } );
  } );

  describe( "when there is no local taxon with taxon id", ( ) => {
    beforeEach( async ( ) => {
      safeRealmWrite( global.realm, ( ) => {
        global.realm.deleteAll( );
      }, "delete all realm, useTaxon test" );
    } );

    it( "should make an API call and return passed in taxon when fetchRemote is enabled", ( ) => {
      const taxonId = faker.number.int( );
      const { result } = renderHook( ( ) => useTaxon( { id: taxonId }, true ) );
      expect( result.current ).not.toHaveProperty( "default_photo" );
    } );
  } );
} );
