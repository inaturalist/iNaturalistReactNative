import { faker } from "@faker-js/faker";
import Geolocation from "@react-native-community/geolocation";
import NetInfo from "@react-native-community/netinfo";
import { screen, waitFor } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import initI18next from "i18n/initI18next";
import fetchMock from "jest-fetch-mock";
import React from "react";
import { LOCATION_FETCH_INTERVAL } from "sharedHooks/useCurrentObservationLocation";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";
import { signIn, signOut } from "tests/helpers/user";

const initialStoreState = useStore.getState( );

beforeEach( async ( ) => {
  useStore.setState( initialStoreState, true );
  global.realm.write( ( ) => {
    global.realm.deleteAll( );
  } );
  const mockUser = factory( "LocalUser", {
    login: faker.internet.userName( ),
    iconUrl: faker.image.url( ),
    locale: "en"
  } );
  await signIn( mockUser );
} );

afterEach( ( ) => {
  signOut( );
  jest.clearAllMocks( );
} );

describe( "ObsEdit offline", ( ) => {
  beforeAll( async () => {
    await initI18next();
  } );

  beforeEach( ( ) => {
    // Turn on fetch mocks and make all fetch requests throw an error
    fetchMock.doMock( );
    fetch.mockAbort( );
    expect( fetch( "/" ) ).rejects.toThrow( );

    // Mock NetInfo so it says internet is not reachable
    NetInfo.fetch.mockImplementation( async ( ) => ( {
      isInternetReachable: false
    } ) );
  } );

  afterEach( ( ) => {
    fetchMock.dontMock( );
  } );

  describe( "creation", ( ) => {
    it( "should fetch coordinates", async ( ) => {
      const mockGetCurrentPosition = jest.fn( ( success, _error, _options ) => success( {
        coords: {
          latitude: 1,
          longitude: 1,
          accuracy: 10,
          timestamp: Date.now( )
        }
      } ) );
      Geolocation.getCurrentPosition.mockImplementation( mockGetCurrentPosition );
      const observation = factory( "LocalObservation", {
        observationPhotos: []
      } );
      useStore.setState( { observations: [observation] } );
      renderComponent(
        <ObsEdit />
      );
      await waitFor( ( ) => {
        expect(
          screen.getByTestId( "EvidenceSection.fetchingLocationIndicator" )
        ).toBeTruthy( );
      } );
      await waitFor( ( ) => {
        expect( mockGetCurrentPosition ).toHaveBeenCalled( );
      }, { timeout: LOCATION_FETCH_INTERVAL * 2 } );
      const coords = await screen.findByText( /Lat:/ );
      expect( coords ).toBeTruthy( );
      expect( screen.queryByText( "Finding location..." ) ).toBeFalsy( );
      await waitFor( ( ) => {
        expect(
          screen.queryByTestId( "EvidenceSection.fetchingLocationIndicator" )
        ).toBeFalsy( );
      } );
    } );
  } );
} );
