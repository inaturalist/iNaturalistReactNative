import { screen } from "@testing-library/react-native";
import ObsDetails from "components/ObsDetails/ObsDetails";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import React from "react";

import factory, { makeResponse } from "../factory";
import { renderAppWithComponent } from "../helpers/render";

const mockComment = factory( "LocalComment" );
const mockObservation = factory( "LocalObservation", {
  comments: [mockComment]
} );
const mockUpdate = factory( "RemoteUpdate", {
  resource_uuid: mockObservation.uuid,
  comment_id: mockComment.id
} );

// Mock api call to observations
jest.mock( "inaturalistjs" );
inatjs.observations.update.mockResolvedValue( makeResponse( [mockUpdate] ) );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    addEventListener: () => {},
    useNavigation: () => ( {
      navigate: jest.fn(),
      setOptions: jest.fn()
    } ),
    useRoute: () => ( {
      params: {
        uuid: mockObservation.uuid
      }
    } )
  };
} );

describe( "ObsDetails", () => {
  beforeAll( async () => {
    await initI18next();

    // Write local observation to Realm
    await global.realm.write( () => {
      global.realm.create( "Observation", mockObservation );
    } );
  } );

  afterEach( () => {
    jest.clearAllMocks();
  } );

  describe( "with an observation where we don't know if the user has viewed comments", () => {
    it( "should make a request to observation/viewedUpdates", async () => {
      // Let's make sure the mock hasn't already been used
      expect( inatjs.observations.viewedUpdates ).not.toHaveBeenCalled();
      // Expect the observation in realm to have comments_viewed param not initialized
      const observation = global.realm.objects( "Observation" )[0];
      expect( observation.comments_viewed ).not.toBeTruthy();
      renderAppWithComponent( <ObsDetails /> );
      expect(
        await screen.findByText( `@${mockObservation.user.login}` )
      ).toBeTruthy();
      expect( inatjs.observations.viewedUpdates ).toHaveBeenCalledTimes( 1 );
      // Expect the observation in realm to have been updated with comments_viewed = true
      expect( observation.comments_viewed ).toBe( true );
    } );
  } );
} );
