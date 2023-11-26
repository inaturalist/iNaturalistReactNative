import { faker } from "@faker-js/faker";
import { renderHook, waitFor } from "@testing-library/react-native";
import { useTaxon } from "sharedHooks";

import factory from "../../factory";

jest.mock( "api/taxa" );

const mockRemoteTaxon = factory( "RemoteTaxon" );

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockRemoteTaxon
  } )
} ) );

const mockTaxon = factory( "LocalTaxon", {
  default_photo: {
    url: faker.image.imageUrl( )
  }
} );

describe( "useTaxon", ( ) => {
  describe( "with local taxon", ( ) => {
    beforeEach( async ( ) => {
      // Write mock taxon to realm
      await global.realm.write( () => {
        global.realm.create( "Taxon", mockTaxon, "modified" );
      } );
    } );

    it( "should return an object", ( ) => {
      const { result } = renderHook( ( ) => useTaxon( mockTaxon ) );
      expect( result.current ).toBeInstanceOf( Object );
    } );

    describe( "when there is a local taxon with taxon id", ( ) => {
      it( "should return local taxon", ( ) => {
        const { result } = renderHook( ( ) => useTaxon( mockTaxon ) );
        expect( result.current ).toHaveProperty( "default_photo" );
      } );
    } );
  } );

  describe( "when there is no local taxon with taxon id", ( ) => {
    beforeEach( async ( ) => {
      await global.realm.write( ( ) => {
        global.realm.deleteAll( );
      } );
    } );

    it( "should save remote taxon and return taxon passed in", async ( ) => {
      const taxon = global.realm.objects( "Taxon" )[0];
      expect( taxon ).toBe( undefined );
      const { result } = renderHook( ( ) => useTaxon( { id: null } ) );
      expect( result.current ).toEqual( { id: null } );
      const remoteTaxon = global.realm.objects( "Taxon" )[0];
      await waitFor( ( ) => {
        expect( remoteTaxon.name ).toEqual( mockRemoteTaxon.name );
      } );
    } );
  } );
} );
