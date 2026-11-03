import ProjectObservationRule from "realmModels/ProjectObservationRule";
import factory from "tests/factory";

describe( "ProjectObservationRule", ( ) => {
  describe( "mapApiToRealm", ( ) => {
    it( "flattens taxon operand details including ancestor_ids", ( ) => {
      const mockRule = factory( "RemoteProjectObservationRule" );
      const mappedRule = ProjectObservationRule.mapApiToRealm( mockRule );

      expect( mappedRule.taxon_ancestor_ids ).toEqual( mockRule.taxon.ancestor_ids );
      expect( mappedRule.taxon_name ).toBe( mockRule.taxon.name );
      expect( mappedRule.taxon_rank_level ).toBe( mockRule.taxon.rank_level );
    } );

    it( "defaults taxon_ancestor_ids to empty when the API omits them", ( ) => {
      const mockRule = factory( "RemoteProjectObservationRule" );
      delete mockRule.taxon.ancestor_ids;
      const mappedRule = ProjectObservationRule.mapApiToRealm( mockRule );

      expect( mappedRule.taxon_ancestor_ids ).toEqual( [] );
    } );
  } );

  describe( "mapRealmToPojo", ( ) => {
    const roundTrip = apiRule => ProjectObservationRule.mapRealmToPojo(
      ProjectObservationRule.mapApiToRealm( apiRule ),
    );

    it( "rebuilds the nested taxon operand", ( ) => {
      const mockRule = factory( "RemoteProjectObservationRule" );

      expect( roundTrip( mockRule ) ).toEqual( mockRule );
    } );

    it( "rebuilds place, user, and project operands", ( ) => {
      const placeRule = {
        id: 1,
        operand_id: 10,
        operand_type: "Place",
        operator: "observed_in_place?",
        place: { display_name: "Some Place", id: 10 },
      };
      const userRule = {
        id: 2,
        operand_id: 20,
        operand_type: "User",
        operator: "not_observed_by_user?",
        user: { id: 20, login: "someuser" },
      };
      const projectRule = {
        id: 3,
        operand_id: 30,
        operand_type: "Project",
        operator: "in_project?",
        project: { id: 30, title: "Some Project" },
      };

      expect( roundTrip( placeRule ) ).toEqual( placeRule );
      expect( roundTrip( userRule ) ).toEqual( userRule );
      expect( roundTrip( projectRule ) ).toEqual( projectRule );
    } );

    it( "returns operand-less rules without operand objects", ( ) => {
      const rule = {
        id: 4,
        operand_id: null,
        operand_type: null,
        operator: "verifiable?",
      };

      expect( roundTrip( rule ) ).toEqual( rule );
    } );
  } );
} );
