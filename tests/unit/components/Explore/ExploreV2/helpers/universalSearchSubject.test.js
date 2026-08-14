import {
  resultToSubject,
  subjectToResult,
  subjectToText,
} from "components/Explore/ExploreV2/helpers/universalSearchSubject";

const USER_RESULT = {
  type: "user",
  user: {
    id: 7,
    login: "seth_msp",
    icon_url: "https://example.com/u.jpg",
    observations_count: 5,
  },
};

const PROJECT_RESULT = {
  type: "project",
  project: {
    id: 9,
    title: "InverteFest",
    project_type: "collection",
    rule_preferences: [],
    icon: "https://example.com/p.jpg",
  },
};

const TAXON_RESULT = {
  type: "taxon",
  taxon: {
    id: 12,
    name: "Eumyias thalassinus",
    preferred_common_name: "Verditer Flycatcher",
    iconic_taxon_name: "Aves",
    default_photo: { url: "https://example.com/t.jpg" },
  },
};

describe( "resultToSubject", ( ) => {
  it( "maps a user result to a user subject", ( ) => {
    expect( resultToSubject( USER_RESULT ) ).toEqual( {
      type: "user",
      user: {
        id: 7,
        login: "seth_msp",
        icon_url: "https://example.com/u.jpg",
        observations_count: 5,
      },
    } );
  } );

  it( "maps a project result to a project subject", ( ) => {
    expect( resultToSubject( PROJECT_RESULT ) ).toEqual( {
      type: "project",
      project: {
        id: 9,
        title: "InverteFest",
        project_type: "collection",
        rule_preferences: [],
        icon: "https://example.com/p.jpg",
      },
    } );
  } );

  it( "maps a taxon result to a taxon subject", ( ) => {
    expect( resultToSubject( TAXON_RESULT ) ).toEqual( {
      type: "taxon",
      taxon: {
        id: 12,
        name: "Eumyias thalassinus",
        preferred_common_name: "Verditer Flycatcher",
        iconic_taxon_name: "Aves",
        default_photo: { url: "https://example.com/t.jpg" },
      },
    } );
  } );
} );

describe( "subjectToResult", ( ) => {
  it.each( [USER_RESULT, PROJECT_RESULT, TAXON_RESULT] )(
    "round trips a $type result",
    result => {
      expect( subjectToResult( resultToSubject( result ) ) ).toEqual( result );
    },
  );

  it( "returns null for subjects that never came from a search result", ( ) => {
    expect( subjectToResult( { type: "unknown" } ) ).toBeNull( );
    expect( subjectToResult( { type: "unobserved", user: { id: 7 } } ) ).toBeNull( );
  } );
} );

describe( "subjectToText", ( ) => {
  it( "returns the login for a user subject", ( ) => {
    const subject = { type: "user", user: { id: 7, login: "seth_msp" } };

    expect( subjectToText( subject, true ) ).toEqual( "seth_msp" );
  } );

  it( "returns the title for a project subject", ( ) => {
    const subject = { type: "project", project: { id: 9, title: "InverteFest" } };

    expect( subjectToText( subject, true ) ).toEqual( "InverteFest" );
  } );

  it( "returns the common name for a taxon when the common name is primary", ( ) => {
    const subject = {
      type: "taxon",
      taxon: { id: 2, name: "Aves", preferred_common_name: "Birds" },
    };

    expect( subjectToText( subject, true ) ).toEqual( "Birds" );
  } );

  it( "returns the scientific name for a taxon when the scientific name is primary", ( ) => {
    const subject = {
      type: "taxon",
      taxon: { id: 2, name: "Aves", preferred_common_name: "Birds" },
    };

    expect( subjectToText( subject, false ) ).toEqual( "Aves" );
  } );

  it( "falls back to the scientific name when there is no common name", ( ) => {
    const subject = {
      type: "taxon",
      taxon: { id: 2, name: "Aves" },
    };

    expect( subjectToText( subject, true ) ).toEqual( "Aves" );
  } );

  it( "returns the Unknown label for an unknown subject", ( ) => {
    const t = key => key;
    const subject = { type: "unknown" };

    expect( subjectToText( subject, true, t ) ).toEqual( "Unknown--taxon" );
  } );
} );
