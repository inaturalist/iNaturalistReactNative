import Taxon from "realmModels/Taxon";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

describe( "Taxon", ( ) => {
  describe( "mapRealmToApi", ( ) => {
    it( "returns the value unchanged when given null or undefined", ( ) => {
      expect( Taxon.mapRealmToApi( null ) ).toBeNull( );
      expect( Taxon.mapRealmToApi( undefined ) ).toBeUndefined( );
    } );

    describe( "with an already-plain snake_case object", ( ) => {
      const apiTaxon = {
        id: 745,
        name: "Silphium perfoliatum",
        rank: "species",
        rank_level: 10,
        iconic_taxon_name: "Plantae",
        ancestor_ids: [1, 2, 3],
        preferred_common_name: "Cup Plant",
        default_photo: {
          id: 7,
          url: "https://example.com/photo.jpg",
          attribution: "(c) someone",
          license_code: "cc-by",
        },
      };

      it( "passes the snake_case fields through unchanged", ( ) => {
        const result = Taxon.mapRealmToApi( apiTaxon );
        expect( result.id ).toBe( 745 );
        expect( result.name ).toBe( "Silphium perfoliatum" );
        expect( result.rank ).toBe( "species" );
        expect( result.rank_level ).toBe( 10 );
        expect( result.iconic_taxon_name ).toBe( "Plantae" );
        expect( result.preferred_common_name ).toBe( "Cup Plant" );
      } );

      it( "maps the default_photo fields", ( ) => {
        const result = Taxon.mapRealmToApi( apiTaxon );
        expect( result.default_photo ).toEqual( {
          id: 7,
          url: "https://example.com/photo.jpg",
          attribution: "(c) someone",
          license_code: "cc-by",
        } );
      } );

      it( "returns a detached array copy of ancestor_ids", ( ) => {
        const result = Taxon.mapRealmToApi( apiTaxon );
        expect( Array.isArray( result.ancestor_ids ) ).toBe( true );
        expect( result.ancestor_ids ).toEqual( [1, 2, 3] );
        // a copy, not the same reference we passed in
        expect( result.ancestor_ids ).not.toBe( apiTaxon.ancestor_ids );
      } );
    } );

    it( "leaves default_photo undefined when the photo has no url", ( ) => {
      const result = Taxon.mapRealmToApi( {
        id: 1,
        name: "Life",
        default_photo: { id: 9, attribution: "(c) someone" },
      } );
      expect( result.default_photo ).toBeUndefined( );
    } );

    describe( "with a live Realm Taxon", ( ) => {
      let realmTaxon;

      beforeEach( ( ) => {
        safeRealmWrite( global.realm, ( ) => {
          realmTaxon = global.realm.create( "Taxon", {
            id: 123,
            name: "Danaus plexippus",
            rank: "species",
            rank_level: 10,
            iconic_taxon_name: "Insecta",
            ancestor_ids: [48460, 1, 47120],
            // exercise the camelCase mapTo accessors
            preferred_common_name: "Monarch",
            default_photo: {
              id: 555,
              url: "https://example.com/monarch.jpg",
              attribution: "(c) lepidopterist",
              license_code: "cc-by-nc",
            },
          } );
        }, "create Taxon for mapRealmToApi test" );
      } );

      afterEach( ( ) => {
        safeRealmWrite( global.realm, ( ) => {
          global.realm.delete( realmTaxon );
        }, "delete Taxon for mapRealmToApi test" );
      } );

      it( "returns a detached plain object, not a live Realm object", ( ) => {
        const result = Taxon.mapRealmToApi( realmTaxon );
        // a plain object literal, not a live Realm.Object the database can invalidate
        expect( Object.getPrototypeOf( result ) ).toBe( Object.prototype );
        expect( result.id ).toBe( 123 );
        expect( result.name ).toBe( "Danaus plexippus" );
        expect( result.rank ).toBe( "species" );
        expect( result.rank_level ).toBe( 10 );
        expect( result.iconic_taxon_name ).toBe( "Insecta" );
      } );
    } );
  } );
} );
