import { waitFor } from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import safeRealmWrite from "sharedHelpers/safeRealmWrite.ts";
import { useTaxon } from "sharedHooks";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderHookInApp } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[mockRealmIdentifier]
    }
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const mockRemoteTaxon = factory( "RemoteTaxon", {
  default_photo: {
    url: faker.image.url( )
  }
} );

const mockTaxon = factory( "LocalTaxon", {
  _syncedAt: faker.date.recent( { days: 1 } ),
  default_photo: {
    url: faker.image.url( )
  }
} );
const mockOutdatedTaxon = factory( "LocalTaxon", {
  _syncedAt: faker.date.recent( { days: 1, refDate: "2024-01-01" } ),
  default_photo: {
    url: faker.image.url( )
  }
} );

describe( "with local taxon", ( ) => {
  beforeEach( ( ) => {
    jest.restoreAllMocks( );
    // Write mock taxon to realm
    safeRealmWrite( global.mockRealms[mockRealmIdentifier], ( ) => {
      global.mockRealms[mockRealmIdentifier].create( "Taxon", mockTaxon, "modified" );
    }, "write mock taxon, useTaxon test" );
  } );

  it( "should return an object", ( ) => {
    const { result } = renderHookInApp( ( ) => useTaxon( mockTaxon ) );
    expect( result.current ).toBeInstanceOf( Object );
  } );

  describe( "when there is a local taxon with taxon id", ( ) => {
    it( "should return local taxon with default photo", ( ) => {
      const { result } = renderHookInApp( ( ) => useTaxon( mockTaxon ) );
      const { taxon: resultTaxon } = result.current;
      expect( resultTaxon ).toHaveProperty( "default_photo" );
      expect( resultTaxon.default_photo.url ).toEqual( mockTaxon.default_photo.url );
    } );

    it( "should request a taxon from the API if the local copy is out of date", async ( ) => {
      inatjs.taxa.fetch.mockResolvedValue( makeResponse( [mockRemoteTaxon] ) );
      safeRealmWrite( global.mockRealms[mockRealmIdentifier], ( ) => {
        global.mockRealms[mockRealmIdentifier].create( "Taxon", mockOutdatedTaxon, "modified" );
      }, "write mock outdated taxon, useTaxon test" );
      renderHookInApp( ( ) => useTaxon( mockOutdatedTaxon ) );
      await waitFor( ( ) => expect( inatjs.taxa.fetch ).toHaveBeenCalled( ) );
    } );
  } );
} );

describe( "when there is no local taxon with taxon id", ( ) => {
  beforeAll( ( ) => {
    safeRealmWrite( global.mockRealms[mockRealmIdentifier], ( ) => {
      global.mockRealms[mockRealmIdentifier].deleteAll( );
    }, "delete all realm, useTaxon test" );
  } );

  describe( "with fetchRemote: true", ( ) => {
    it( "should request the taxon from the API", async ( ) => {
      expect(
        global.mockRealms[mockRealmIdentifier].objectForPrimaryKey( "Taxon", mockTaxon.id )
      ).toBeNull( );
      renderHookInApp( ( ) => useTaxon( mockTaxon ) );
      await waitFor( ( ) => expect( inatjs.taxa.fetch ).toHaveBeenCalled( ) );
    } );

    it( "should return the argument taxon if request fails", ( ) => {
      // I don't love this. While it kind of mocks at the edge of the code
      // we need to integrate, it doesn't test out API error handling code.
      // I tried mocking inatjs to make it throw, but that always seems to
      // result in a failure in the test, even though useQuery should catch
      // those errors. ~~~kueda20240305
      jest.mock( "@tanstack/react-query", () => ( {
        useQuery: jest.fn( ( ) => ( {
          error: { }
        } ) )
      } ) );
      const partialTaxon = { id: faker.number.int( ), foo: "bar" };
      const { result } = renderHookInApp( ( ) => useTaxon( partialTaxon ) );
      expect( result.current.taxon.foo ).toEqual( "bar" );
      jest.unmock( "@tanstack/react-query" );
    } );

    it( "should return a taxon like a local taxon record if the request succeeds", async ( ) => {
      const { result } = renderHookInApp( ( ) => useTaxon( { id: mockTaxon.id } ) );
      await waitFor( ( ) => expect( result.current.taxon ).toHaveProperty( "default_photo" ) );
    } );
  } );

  describe( "with fetchRemote: false", ( ) => {
    it( "should not call the API and return passed in taxon", ( ) => {
      const taxonId = faker.number.int( );
      expect(
        global.mockRealms[mockRealmIdentifier].objectForPrimaryKey( "Taxon", taxonId )
      ).toBeNull( );
      const { result } = renderHookInApp( ( ) => useTaxon( { id: taxonId, foo: "bar" }, false ) );
      expect( result.current.taxon ).not.toHaveProperty( "default_photo" );
      expect( result.current.taxon.foo ).toEqual( "bar" );
    } );
  } );
} );
