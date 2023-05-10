import { screen } from "@testing-library/react-native";
import ObsDetails from "components/ObsDetails/ObsDetails";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import React from "react";

import factory, { makeResponse } from "../factory";
import { renderAppWithComponent } from "../helpers/render";

const mockObservation = factory( "LocalObservation" );

// Mock api call to observations/fetch
jest.mock( "inaturalistjs" );
inatjs.observations.fetch.mockResolvedValue( makeResponse( [mockObservation] ) );

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
  } );

  afterEach( () => {
    jest.clearAllMocks();
  } );

  describe( "when there is an observation", () => {
    it( "should make a request to observations/updates", async () => {
      // Let's make sure the mock hasn't already been used
      expect( inatjs.observations.updates ).not.toHaveBeenCalled();
      renderAppWithComponent( <ObsDetails /> );
      expect( await screen.findByText( `@${mockObservation.user.login}` ) ).toBeTruthy();
      expect( inatjs.observations.updates ).toHaveBeenCalled();
    } );
  } );
} );
