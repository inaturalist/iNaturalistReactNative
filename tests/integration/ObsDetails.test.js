import { faker } from "@faker-js/faker";
import { screen, waitFor } from "@testing-library/react-native";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import React from "react";

import factory, { makeResponse } from "../factory";
import { renderAppWithComponent } from "../helpers/render";

const mockComment = factory( "LocalComment" );
const mockObservation = factory( "LocalObservation", {
  comments: [mockComment],
  user: factory( "LocalUser", {
    login: faker.internet.userName( ),
    iconUrl: faker.image.imageUrl( ),
    locale: "en"
  } )
} );
const mockUpdate = factory( "RemoteUpdate", {
  resource_uuid: mockObservation.uuid,
  comment_id: mockComment.id,
  viewed: false
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
      setOptions: jest.fn(),
      canGoBack: jest.fn( ( ) => true )
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

    jest.useFakeTimers( );
  } );

  afterEach( () => {
    jest.clearAllMocks();
  } );

  describe( "with an observation where we don't know if the user has viewed comments", () => {
    beforeEach( async () => {
      // Write local observation to Realm
      await global.realm.write( () => {
        global.realm.create( "Observation", mockObservation );
      } );
    } );
    it( "should make a request to observation/viewedUpdates", async () => {
      // Let's make sure the mock hasn't already been used
      expect( inatjs.observations.viewedUpdates ).not.toHaveBeenCalled();
      // Expect the observation in realm to have comments_viewed param not initialized
      const observation = global.realm.objects( "Observation" )[0];
      expect( observation.comments_viewed ).not.toBeTruthy();
      renderAppWithComponent( <ObsDetailsContainer /> );
      expect(
        await screen.findByText( `@${mockObservation.user.login}` )
      ).toBeTruthy();
      expect( inatjs.observations.viewedUpdates ).toHaveBeenCalledTimes( 1 );
      // Expect the observation in realm to have been updated with comments_viewed = true
      await waitFor( ( ) => {
        expect( observation.comments_viewed ).toBe( true );
      } );
    } );
  } );
} );
