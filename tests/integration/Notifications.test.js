import { screen, waitFor } from "@testing-library/react-native";
import Notifications from "components/Notifications/Notifications";
import inatjs from "inaturalistjs";
import React from "react";
import factory, { makeResponse } from "tests/factory";
import { queryClient, renderAppWithComponent } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier,
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[mockRealmIdentifier],
      useQuery: ( ) => [],
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const mockUser = factory( "LocalUser" );

function makeMockObsUpdatesResponse( mockObs ) {
  const mockObservation = mockObs || factory( "RemoteObservation", {
    user: mockUser,
  } );
  const mockComment = factory( "RemoteComment", { parent_id: mockObservation.id } );
  const mockUpdate = {
    id: 123,
    created_at: mockComment.created_at,
    comment: mockComment,
    comment_id: mockComment.id,
    notifier_id: mockComment.id,
    notifier_type: "Comment",
    notification: "activity",
    resource_owner_id: mockUser.id,
    resource_type: "Observation",
    resource_id: mockObservation.id,
    resource_uuid: mockObservation.uuid,
    viewed: false,
  };
  const obsUpdatesResponse = makeResponse( [mockUpdate] );
  inatjs.observations.updates.mockResolvedValue( obsUpdatesResponse );
  inatjs.observations.fetch.mockResolvedValue( makeResponse( [mockObservation] ) );
  return obsUpdatesResponse;
}

describe( "Notifications", () => {
  beforeEach( async () => {
    jest.useFakeTimers( );
    signIn( mockUser, { realm: global.mockRealms[__filename] } );
  } );

  afterEach( () => {
    jest.clearAllMocks();
    signOut( { realm: global.mockRealms[__filename] } );
    queryClient.clear( );
  } );

  it( "should show a notification", async ( ) => {
    makeMockObsUpdatesResponse( );
    renderAppWithComponent( <Notifications /> );
    await waitFor( ( ) => {
      expect( inatjs.observations.updates ).toHaveBeenCalled( );
    } );
    expect(
      await screen.findByText( /added a comment to an observation by you/ ),
    ).toBeVisible( );
  } );

  it( "should show a photo for an observation not in the local database", async ( ) => {
    const mockObservation = factory( "RemoteObservation", {
      observation_photos: [
        factory( "RemoteObservationPhoto" ),
      ],
    } );
    const localObservation = global.mockRealms[__filename].objectForPrimaryKey(
      "Observation",
      mockObservation.uuid,
    );
    expect( localObservation ).toBeFalsy( );
    const photoUrl = mockObservation.observation_photos[0].photo.url;
    expect( photoUrl ).toBeTruthy( );
    const response = makeMockObsUpdatesResponse( mockObservation );
    const { comment } = response.results[0];
    expect( response.results[0].resource_uuid ).toEqual( mockObservation.uuid );
    renderAppWithComponent( <Notifications /> );
    expect( await screen.findByText( comment.user.login ) ).toBeVisible( );
    const localObservationAfter = global.mockRealms[__filename].objectForPrimaryKey(
      "Observation",
      mockObservation.uuid,
    );
    expect( localObservationAfter ).toBeTruthy( );
    const image = await screen.findByTestId( "ObservationIcon.photo" );
    await waitFor( () => {
      expect( image.props.source ).toStrictEqual( { uri: photoUrl } );
    } );
  } );
} );
