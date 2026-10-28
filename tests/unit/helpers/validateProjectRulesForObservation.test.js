import validateProjectRulesForObservation, {
  validateProjectRules,
} from "sharedHelpers/validateProjectRulesForObservation";
import factory from "tests/factory";

const AVES_ID = 3;
const SANDERLING_ID = 4789;
const MAMMALIA_ID = 40151;

const rule = ( operator, overrides = {} ) => ( {
  id: Math.floor( Math.random( ) * 1_000_000 ),
  operator,
  ...overrides,
} );

const taxonRule = taxonId => rule( "in_taxon?", {
  operand_id: taxonId,
  operand_type: "Taxon",
  taxon: { ancestor_ids: [48460, 1, taxonId], id: taxonId, name: "Taxon" },
} );

const project = rules => factory( "LocalProject", {
  project_observation_rules: rules,
} );

const sanderling = {
  ancestor_ids: [48460, 1, 2, 355675, AVES_ID, 67566, SANDERLING_ID],
  id: SANDERLING_ID,
};

const observation = ( overrides = {} ) => ( {
  ...factory( "LocalObservation" ),
  captive_flag: false,
  latitude: null,
  longitude: null,
  privateLatitude: null,
  privateLongitude: null,
  taxon: null,
  taxon_id: null,
  ...overrides,
} );

const statusFor = ( obs, operator, rules ) => validateProjectRules(
  obs,
  project( rules || [rule( operator )] ),
).find( group => group.operator === operator )?.status;

describe( "validateProjectRules", ( ) => {
  describe( "client-checkable rules", ( ) => {
    test.each( [
      ["captive?", { captive_flag: true }, "pass"],
      ["captive?", { captive_flag: false }, "fail"],
      ["wild?", { captive_flag: false }, "pass"],
      ["wild?", { captive_flag: null }, "pass"],
      ["wild?", { captive_flag: true }, "fail"],
      ["georeferenced?", { latitude: 37.7, longitude: -122.4 }, "pass"],
      ["georeferenced?", { latitude: 0, longitude: 0 }, "pass"],
      ["georeferenced?", { privateLatitude: 37.7, privateLongitude: -122.4 }, "pass"],
      ["georeferenced?", { latitude: 37.7 }, "fail"],
      ["georeferenced?", {}, "fail"],
      ["has_a_photo?", { observationPhotos: [factory( "LocalObservationPhoto" )] }, "pass"],
      ["has_a_photo?", { observationSounds: [factory( "LocalObservationSound" )] }, "fail"],
      ["has_a_sound?", { observationSounds: [factory( "LocalObservationSound" )] }, "pass"],
      ["has_a_sound?", { observationPhotos: [factory( "LocalObservationPhoto" )] }, "fail"],
      ["has_media?", { observationPhotos: [factory( "LocalObservationPhoto" )] }, "pass"],
      ["has_media?", { observationSounds: [factory( "LocalObservationSound" )] }, "pass"],
      ["has_media?", {}, "fail"],
      ["identified?", { taxon: sanderling }, "pass"],
      ["identified?", { taxon_id: SANDERLING_ID }, "pass"],
      ["identified?", {}, "fail"],
    ] )( "%s with %p should %s", ( operator, overrides, expected ) => {
      expect( statusFor( observation( overrides ), operator ) ).toBe( expected );
    } );
  } );

  describe( "rules the server confirms", ( ) => {
    test.each( [
      ["coordinates_shareable_by_project_curators?"],
      ["observed_in_place?"],
      ["on_list?"],
    ] )( "%s should be unknown", operator => {
      const obs = observation( {
        latitude: 37.7,
        longitude: -122.4,
        observationPhotos: [factory( "LocalObservationPhoto" )],
        taxon: sanderling,
      } );
      expect( statusFor( obs, operator ) ).toBe( "unknown" );
    } );

    test.each( [
      ["observed_in_place?", "without a location", { taxon: sanderling }],
      ["on_list?", "without a taxon", { latitude: 37.7, longitude: -122.4 }],
    ] )( "%s should fail %s", ( operator, _description, overrides ) => {
      expect( statusFor( observation( overrides ), operator ) ).toBe( "fail" );
    } );
  } );

  describe( "verifiable?", ( ) => {
    const verifiableObservation = ( overrides = {} ) => observation( {
      latitude: 37.7,
      longitude: -122.4,
      observationPhotos: [factory( "LocalObservationPhoto" )],
      observed_on_string: "2024-05-01T09:30:00",
      ...overrides,
    } );

    test.each( [
      ["when wild with evidence, location, and date", "pass", {}],
      ["with only a sound as evidence", "pass", {
        observationPhotos: [],
        observationSounds: [factory( "LocalObservationSound" )],
      }],
      ["with a date only from time_observed_at", "pass", {
        observed_on_string: null,
        time_observed_at: "2024-05-01T16:30:00Z",
      }],
      ["when captive", "fail", { captive_flag: true }],
      ["when identified as human", "fail", { taxon: { id: 43584, name: "Homo sapiens" } }],
      ["when identified as genus Homo", "fail", { taxon: { id: 43583, name: "Homo" } }],
      ["when identified as a genus whose name starts with Homo", "pass", {
        taxon: { id: 99999, name: "Homoeosoma" },
      }],
      ["without evidence", "fail", { observationPhotos: [] }],
      ["without a location", "fail", { latitude: null, longitude: null }],
      ["without a date", "fail", { observed_on_string: null }],
      ["with an unparseable date", "fail", { observed_on_string: "not a date" }],
    ] )( "%s should %s", ( _description, expected, overrides ) => {
      expect( statusFor( verifiableObservation( overrides ), "verifiable?" ) ).toBe( expected );
    } );
  } );

  describe( "in_taxon?", ( ) => {
    it( "should pass when the observation taxon is the rule taxon", ( ) => {
      const obs = observation( { taxon: sanderling } );
      expect( statusFor( obs, "in_taxon?", [taxonRule( SANDERLING_ID )] ) ).toBe( "pass" );
    } );

    it( "should pass when the rule taxon is an ancestor", ( ) => {
      const obs = observation( { taxon: sanderling } );
      expect( statusFor( obs, "in_taxon?", [taxonRule( AVES_ID )] ) ).toBe( "pass" );
    } );

    it( "should fail when the rule taxon is not an ancestor", ( ) => {
      const obs = observation( { taxon: sanderling } );
      expect( statusFor( obs, "in_taxon?", [taxonRule( MAMMALIA_ID )] ) ).toBe( "fail" );
    } );

    it( "should pass when the observation has no taxon, like the server", ( ) => {
      expect( statusFor( observation( ), "in_taxon?", [taxonRule( AVES_ID )] ) ).toBe( "pass" );
    } );

    it( "should be unknown when the observation taxon has no ancestry", ( ) => {
      const obs = observation( { taxon: { ancestor_ids: [], id: SANDERLING_ID + 1 } } );
      expect( statusFor( obs, "in_taxon?", [taxonRule( AVES_ID )] ) ).toBe( "unknown" );
    } );

    it( "should be unknown when only the taxon ID is known", ( ) => {
      const obs = observation( { taxon_id: SANDERLING_ID + 1 } );
      expect( statusFor( obs, "in_taxon?", [taxonRule( AVES_ID )] ) ).toBe( "unknown" );
    } );
  } );

  describe( "combining rules", ( ) => {
    it( "should pass a group when any rule with that operator passes", ( ) => {
      const obs = observation( { taxon: sanderling } );
      const rules = [taxonRule( MAMMALIA_ID ), taxonRule( AVES_ID )];
      expect( statusFor( obs, "in_taxon?", rules ) ).toBe( "pass" );
    } );

    it( "should fail a group when every rule with that operator fails", ( ) => {
      const obs = observation( { taxon: sanderling } );
      const rules = [taxonRule( MAMMALIA_ID ), taxonRule( 47126 )];
      expect( statusFor( obs, "in_taxon?", rules ) ).toBe( "fail" );
    } );

    it( "should leave a group unknown when no rule passes and one is missing its taxon", ( ) => {
      const obs = observation( { taxon: sanderling } );
      const rules = [taxonRule( MAMMALIA_ID ), rule( "in_taxon?" )];
      expect( statusFor( obs, "in_taxon?", rules ) ).toBe( "unknown" );
    } );

    it( "should return one group per operator in display order", ( ) => {
      const groups = validateProjectRules( observation( ), project( [
        taxonRule( AVES_ID ),
        rule( "identified?" ),
        taxonRule( MAMMALIA_ID ),
        rule( "wild?" ),
      ] ) );
      expect( groups.map( group => group.operator ) )
        .toEqual( ["wild?", "identified?", "in_taxon?"] );
      expect( groups[2].rules ).toHaveLength( 2 );
    } );

    it( "should not return a group for has_observation_field?", ( ) => {
      const rules = [rule( "has_observation_field?" )];
      expect( validateProjectRules( observation( ), project( rules ) ) ).toEqual( [] );
    } );
  } );
} );

describe( "validateProjectRulesForObservation", ( ) => {
  it( "should fail only georeferenced? for an identified observation without coordinates", ( ) => {
    const mockProject = project( [taxonRule( AVES_ID ), rule( "georeferenced?" )] );
    const result = validateProjectRulesForObservation(
      observation( { taxon: sanderling } ),
      [mockProject],
    );
    expect( result.valid ).toBe( false );
    expect( result.errors ).toEqual( [expect.objectContaining( {
      operator: "georeferenced?",
      projectId: mockProject.id,
      status: "fail",
    } )] );
  } );

  it( "should not block on rules only the server can check", ( ) => {
    const obs = observation( { latitude: 37.7, longitude: -122.4, taxon: sanderling } );
    const result = validateProjectRulesForObservation( obs, [
      project( [rule( "on_list?" ), rule( "observed_in_place?" )] ),
    ] );
    expect( result.valid ).toBe( true );
    expect( result.groups.map( group => group.status ) ).toEqual( ["unknown", "unknown"] );
  } );

  it( "should report errors only for the failing project", ( ) => {
    const passingProject = project( [rule( "wild?" )] );
    const failingProject = project( [rule( "identified?" )] );
    const result = validateProjectRulesForObservation(
      observation( ),
      [passingProject, failingProject],
    );
    expect( result.groups ).toHaveLength( 2 );
    expect( result.errors.map( error => error.projectId ) ).toEqual( [failingProject.id] );
  } );

  it( "should be valid without an observation", ( ) => {
    expect( validateProjectRulesForObservation( null, [project( [rule( "identified?" )] )] ) )
      .toEqual( { errors: [], groups: [], valid: true } );
  } );
} );
