import getObservationParticipants from "sharedHelpers/getObservationParticipants";
import factory from "tests/factory";

const observer = factory( "RemoteUser" );
const commenter = factory( "RemoteUser" );
const identifier = factory( "RemoteUser" );
const currentUser = factory( "RemoteUser" );

const logins = ( users: { login?: string }[] ) => users.map( user => user.login );

describe( "getObservationParticipants", () => {
  it( "lists the observer first, then others by most recent activity", () => {
    const observation = {
      user: observer,
      comments: [{ user: commenter, created_at: "2026-01-01T00:00:00Z" }],
      identifications: [{ user: identifier, created_at: "2026-02-01T00:00:00Z" }],
    };
    expect( logins( getObservationParticipants( observation, currentUser.id, 10 ) ) ).toEqual( [
      observer.login,
      identifier.login,
      commenter.login,
    ] );
  } );

  it( "lists each user once, at their most recent activity", () => {
    const observation = {
      user: observer,
      comments: [
        { user: commenter, created_at: "2026-01-01T00:00:00Z" },
        { user: commenter, created_at: "2026-03-01T00:00:00Z" },
        { user: observer, created_at: "2026-04-01T00:00:00Z" },
      ],
      identifications: [{ user: identifier, created_at: "2026-02-01T00:00:00Z" }],
    };
    expect( logins( getObservationParticipants( observation, currentUser.id, 10 ) ) ).toEqual( [
      observer.login,
      commenter.login,
      identifier.login,
    ] );
  } );

  it( "leaves out the current user, including when they're the observer", () => {
    const observation = {
      user: currentUser,
      comments: [
        { user: currentUser, created_at: "2026-02-01T00:00:00Z" },
        { user: commenter, created_at: "2026-01-01T00:00:00Z" },
      ],
    };
    expect( logins( getObservationParticipants( observation, currentUser.id, 10 ) ) ).toEqual( [
      commenter.login,
    ] );
  } );

  it( "leaves out hidden comments and identifications", () => {
    const observation = {
      user: observer,
      comments: [{ user: commenter, created_at: "2026-01-01T00:00:00Z", hidden: true }],
      identifications: [{ user: identifier, created_at: "2026-02-01T00:00:00Z", hidden: true }],
    };
    expect( logins( getObservationParticipants( observation, currentUser.id, 10 ) ) ).toEqual( [
      observer.login,
    ] );
  } );

  it( "keeps withdrawn identifications", () => {
    const observation = {
      user: observer,
      identifications: [{ user: identifier, created_at: "2026-02-01T00:00:00Z", current: false }],
    };
    expect( logins( getObservationParticipants( observation, currentUser.id, 10 ) ) ).toEqual( [
      observer.login,
      identifier.login,
    ] );
  } );

  it( "caps the list at the limit, keeping the observer", () => {
    const others = [1, 2, 3, 4].map( day => ( {
      user: factory( "RemoteUser" ),
      created_at: `2026-01-0${day}T00:00:00Z`,
    } ) );
    const observation = { user: observer, comments: others };
    expect( logins( getObservationParticipants( observation, currentUser.id, 3 ) ) ).toEqual( [
      observer.login,
      others[3].user.login,
      others[2].user.login,
    ] );
  } );

  it( "returns plain users with only the fields mentions need", () => {
    const observation = { user: observer };
    expect( getObservationParticipants( observation, currentUser.id, 10 ) ).toEqual( [{
      icon_url: observer.icon_url,
      id: observer.id,
      login: observer.login,
      name: observer.name,
    }] );
  } );

  it( "returns only the observer when there is no activity", () => {
    expect( logins( getObservationParticipants( { user: observer }, currentUser.id, 10 ) ) )
      .toEqual( [observer.login] );
  } );

  it( "returns nothing for your own observation with no activity", () => {
    expect( getObservationParticipants( { user: currentUser }, currentUser.id, 10 ) )
      .toEqual( [] );
  } );

  it( "returns nothing without an observation", () => {
    expect( getObservationParticipants( null, currentUser.id, 10 ) ).toEqual( [] );
  } );
} );
