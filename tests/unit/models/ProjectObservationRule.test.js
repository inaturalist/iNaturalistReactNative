import ProjectObservationRule from "realmModels/ProjectObservationRule";
import Taxon from "realmModels/Taxon";
import factory from "tests/factory";

describe( "ProjectObservationRule", ( ) => {
  describe( "mapApiToRealm", ( ) => {
    it( "persists only rule scalars, not nested taxon fields", ( ) => {
      const mockRule = factory( "RemoteProjectObservationRule" );
      const mappedRule = ProjectObservationRule.mapApiToRealm( mockRule );

      expect( mappedRule ).toEqual( {
        id: mockRule.id,
        operand_id: mockRule.operand_id,
        operator: mockRule.operator,
        place_display_name: undefined,
      } );
    } );
  } );

  describe( "mapRealmToPojo", ( ) => {
    const roundTrip = ( apiRule, realm = global.realm ) => ProjectObservationRule.mapRealmToPojo(
      ProjectObservationRule.mapApiToRealm( apiRule ),
      realm,
    );

    it( "rebuilds the nested taxon operand from the Taxon table", ( ) => {
      const mockRule = factory( "RemoteProjectObservationRule" );
      const mappedTaxon = Taxon.mapApiToRealm( mockRule.taxon, global.realm );
      global.realm.write( ( ) => {
        global.realm.create(
          "Taxon",
          Taxon.forUpdate( mappedTaxon ),
          "modified",
        );
      } );

      const pojo = roundTrip( mockRule, global.realm );
      expect( pojo ).toMatchObject( {
        id: mockRule.id,
        operand_id: mockRule.operand_id,
        operator: mockRule.operator,
      } );
      expect( pojo.taxon ).toMatchObject( {
        ancestor_ids: mockRule.taxon.ancestor_ids,
        id: mockRule.taxon.id,
        name: mockRule.taxon.name,
        preferred_common_name: mockRule.taxon.preferred_common_name,
        rank: mockRule.taxon.rank,
        rank_level: mockRule.taxon.rank_level,
      } );
      expect( pojo.taxon.default_photo?.url ).toBe( mockRule.taxon.default_photo.url );
    } );

    it( "omits the taxon photo when the API omits it", ( ) => {
      const mockRule = factory( "RemoteProjectObservationRule" );
      delete mockRule.taxon.default_photo;
      const mappedTaxon = Taxon.mapApiToRealm( mockRule.taxon, global.realm );
      global.realm.write( ( ) => {
        global.realm.create(
          "Taxon",
          Taxon.forUpdate( mappedTaxon ),
          "modified",
        );
      } );

      const pojo = roundTrip( mockRule, global.realm );
      expect( pojo.taxon.default_photo ).toBeUndefined( );
      expect( pojo.taxon.name ).toBe( mockRule.taxon.name );
    } );

    it( "hydrates in_taxon? to id-only when the Taxon row is absent", ( ) => {
      const mockRule = factory( "RemoteProjectObservationRule" );

      expect( roundTrip( mockRule, global.realm ) ).toEqual( {
        id: mockRule.id,
        operand_id: mockRule.operand_id,
        operator: mockRule.operator,
        taxon: { id: mockRule.operand_id },
      } );
    } );

    it( "rebuilds the place operand from operator", ( ) => {
      const placeRule = {
        id: 1,
        operand_id: 10,
        operator: "observed_in_place?",
        place: { display_name: "Some Place", id: 10 },
      };

      expect( roundTrip( placeRule ) ).toEqual( placeRule );
    } );

    it( "returns operand-less rules without operand objects", ( ) => {
      const rule = {
        id: 4,
        operand_id: null,
        operator: "verifiable?",
      };

      expect( roundTrip( rule ) ).toEqual( rule );
    } );
  } );
} );
