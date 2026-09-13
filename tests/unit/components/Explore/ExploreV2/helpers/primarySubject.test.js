import primarySubject from "components/Explore/ExploreV2/helpers/primarySubject";
import {
  defaultExploreV2Filters,
  EXPLORE_V2_PLACE_MODE,
  initialExploreV2State,
} from "providers/ExploreV2Context";
import factory from "tests/factory";

const TAXON = {
  id: 745,
  name: "Silphium perfoliatum",
  rank_level: 10,
};

const makeState = ( { subject = null, filters = {} } = {} ) => ( {
  ...initialExploreV2State,
  location: { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE },
  subject,
  filters: { ...defaultExploreV2Filters, ...filters },
} );

describe( "primarySubject", ( ) => {
  it( "falls back to the location when nothing is being searched for", ( ) => {
    expect( primarySubject( makeState( ) ) ).toEqual( { display: "location" } );
  } );

  describe( "subjects set by Universal Search", ( ) => {
    it.each( [
      ["taxon", { type: "taxon", taxon: TAXON }],
      ["unknown", { type: "unknown" }],
      ["user", { type: "user", user: { id: 7, login: "seth_msp" } }],
      ["project", { type: "project", project: { id: 9, title: "Backyard Birds" } }],
    ] )( "shows a %s subject", ( _name, subject ) => {
      expect( primarySubject( makeState( { subject } ) ) )
        .toEqual( { display: "subject", subject } );
    } );

    it( "shows an unobserved subject without naming the user", ( ) => {
      const subject = { type: "unobserved", user: { id: 7, login: "seth_msp" } };
      expect( primarySubject( makeState( { subject } ) ) ).toEqual( { display: "unobserved" } );
    } );
  } );

  describe( "filters set by Advanced Search", ( ) => {
    it( "shows the user", ( ) => {
      const user = factory( "RemoteUser" );
      expect( primarySubject( makeState( { filters: { user } } ) ) ).toEqual( {
        display: "subject",
        subject: {
          type: "user",
          user: {
            id: user.id,
            login: user.login,
            icon_url: user.icon_url,
            observations_count: user.observations_count,
          },
        },
      } );
    } );

    it( "shows the project", ( ) => {
      const project = factory( "RemoteProject" );
      expect( primarySubject( makeState( { filters: { project } } ) ) ).toEqual( {
        display: "subject",
        subject: { type: "project", project },
      } );
    } );
  } );

  describe( "priority", ( ) => {
    const user = factory( "RemoteUser" );
    const project = factory( "RemoteProject" );

    it( "puts a taxon subject above a user and a project filter", ( ) => {
      const subject = { type: "taxon", taxon: TAXON };
      const state = makeState( { subject, filters: { user, project } } );
      expect( primarySubject( state ) ).toEqual( { display: "subject", subject } );
    } );

    it( "puts a user filter above a project filter", ( ) => {
      const state = makeState( { filters: { user, project } } );
      expect( primarySubject( state ) ).toMatchObject( {
        display: "subject",
        subject: { type: "user" },
      } );
    } );

    it( "puts a user filter above a project subject", ( ) => {
      const subject = { type: "project", project };
      const state = makeState( { subject, filters: { user } } );
      expect( primarySubject( state ) ).toMatchObject( {
        display: "subject",
        subject: { type: "user" },
      } );
    } );
  } );
} );
