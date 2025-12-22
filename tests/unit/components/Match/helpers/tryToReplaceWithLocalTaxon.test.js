import tryToReplaceWithLocalTaxon from "components/Match/helpers/tryToReplaceWithLocalTaxon";
import factory from "tests/factory";

describe( "tryToReplaceWithLocalTaxon", () => {
  it( "should return original suggestion when local taxa array is empty", () => {
    const localTaxa = [];
    const suggestion = {
      combined_score: 92,
      taxon: factory( "RemoteTaxon", { id: 745 } )
    };

    const result = tryToReplaceWithLocalTaxon( localTaxa, suggestion );

    expect( result ).toEqual( suggestion );
  } );

  it( "should return original suggestion when no matching local taxon is found", () => {
    const localTaxa = [
      factory( "LocalTaxon", { id: 746, name: "Silphium laciniatum" } ),
      factory( "LocalTaxon", { id: 747, name: "Silphium integrifolium" } )
    ];
    const suggestion = {
      combined_score: 88,
      taxon: factory( "RemoteTaxon", { id: 745, name: "Silphium perfoliatum" } )
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
      representative_photo: [{ photo: { id: 678 } }]
    } );
    const localTaxa = [localTaxon];
    const suggestion = {
      combined_score: 95,
      taxon: {
        id: 745,
        name: "Silphium perfoliatum",
        taxon_photos: [{ photo: { id: 123 } }],
        iconic_taxon_name: "Plantae",
        representative_photo: [{ photo: { id: 456 } }]
      }
    };

    const result = tryToReplaceWithLocalTaxon( localTaxa, suggestion );

    expect( result ).toEqual( { ...suggestion, taxon: { ...suggestion.taxon, ...localTaxon } } );
  } );
} );
