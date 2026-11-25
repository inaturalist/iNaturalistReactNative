import tryToReplaceWithLocalTaxon from "components/Match/helpers/tryToReplaceWithLocalTaxon";
import { UpdateMode } from "realm";
import Taxon from "realmModels/Taxon";
import factory from "tests/factory";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier,
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

describe( "tryToReplaceWithLocalTaxon", () => {
  it( "should return original suggestion when local taxa array is empty", () => {
    const localTaxa = [];
    const suggestion = {
      combined_score: 92,
      taxon: factory( "RemoteTaxon", { id: 745 } ),
    };

    const result = tryToReplaceWithLocalTaxon( localTaxa, suggestion );

    expect( result ).toEqual( suggestion );
  } );

  it( "should return original suggestion when no matching local taxon is found", () => {
    const localTaxa = [
      factory( "LocalTaxon", { id: 746, name: "Silphium laciniatum" } ),
      factory( "LocalTaxon", { id: 747, name: "Silphium integrifolium" } ),
    ];
    const suggestion = {
      combined_score: 88,
      taxon: factory( "RemoteTaxon", { id: 745, name: "Silphium perfoliatum" } ),
    };

    const result = tryToReplaceWithLocalTaxon( localTaxa, suggestion );

    expect( result ).toEqual( suggestion );
  } );

  it( "should merge local taxon data when matching taxon is found", () => {
    const localTaxon = factory( "LocalTaxon", {
      id: 745,
      name: "Silphium perfoliatum",
      preferred_common_name: "Cup Plant",
      rank: "species",
      rank_level: 10,
      _synced_at: new Date( "2024-01-15" ),
      representative_photo: [{ photo: { id: 678 } }],
    } );
    const localTaxa = [localTaxon];
    const suggestion = {
      combined_score: 95,
      taxon: {
        id: 745,
        name: "Silphium perfoliatum",
        taxon_photos: [{ photo: { id: 123 } }],
        iconic_taxon_name: "Plantae",
        representative_photo: [{ photo: { id: 456 } }],
      },
    };

    const result = tryToReplaceWithLocalTaxon( localTaxa, suggestion );

    expect( result ).toEqual( { ...suggestion, taxon: { ...suggestion.taxon, ...localTaxon } } );
  } );

  it( "should keep the taxon's photo readable after the taxon is saved again", () => {
    const realm = global.mockRealms[mockRealmIdentifier];
    const apiTaxon = factory( "RemoteTaxon", {
      rank: "species",
      rank_level: 10,
      default_photo: { id: 678, url: "https://static.inaturalist.org/photos/678/square.jpg" },
    } );
    // Online suggestions save their taxa to Realm each time they arrive
    const saveTaxon = ( ) => realm.write( ( ) => {
      const taxonForUpdate = Taxon.forUpdate( Taxon.mapApiToRealm( apiTaxon ) );
      realm.create( "Taxon", taxonForUpdate, UpdateMode.Modified );
    } );
    saveTaxon( );
    const suggestion = { combined_score: 95, taxon: { id: apiTaxon.id, name: apiTaxon.name } };

    const result = tryToReplaceWithLocalTaxon(
      realm.objects( "Taxon" ).filtered( "id IN $0", [apiTaxon.id] ),
      suggestion,
    );
    saveTaxon( );

    expect( result.taxon.default_photo.url ).toEqual( apiTaxon.default_photo.url );
  } );
} );
