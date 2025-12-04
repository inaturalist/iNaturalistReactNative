import { useRoute } from "@react-navigation/native";
import { screen } from "@testing-library/react-native";
import ObsDetailsDefaultModeScreensWrapper
  from "components/ObsDetailsDefaultMode/ObsDetailsDefaultModeScreensWrapper";
import React from "react";
import * as useCurrentUser from "sharedHooks/useCurrentUser";
import * as useLocalObservation from "sharedHooks/useLocalObservation";
import * as useRemoteObservation from "sharedHooks/useRemoteObservation";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockCurrentUser = factory( "LocalUser", {
  id: 123,
  login: faker.internet.userName( )
} );

const mockLocalObservation = factory( "LocalObservation", {
  user: factory( "LocalUser", {
    id: 123
  } ),
  uuid: "test-123"
} );

const mockParams = {
  uuid: "test-123"
};

jest.mock( "@react-native-community/netinfo", () => ( {
  useNetInfo: () => ( { isConnected: true } ),
  configure: jest.fn( )
} ) );

jest.mock( "sharedHooks/useCurrentUser", () => jest.fn() );
jest.mock( "sharedHooks/useLocalObservation", () => jest.fn() );
jest.mock( "sharedHooks/useRemoteObservation", () => jest.fn() );

describe( "ObsDetailsDefaultModeScreensWrapper", ( ) => {
  beforeEach( ( ) => {
    useRoute.mockReturnValue( {
      params: mockParams
    } );

    useCurrentUser.mockReturnValue( mockCurrentUser );

    useLocalObservation.mockReturnValue( {
      localObservation: null,
      markDeletedLocally: jest.fn( ),
      markViewedLocally: jest.fn( )
    } );

    useRemoteObservation.mockReturnValue( {
      remoteObservation: null,
      refetchRemoteObservation: jest.fn( ),
      isRefetching: false,
      fetchRemoteObservationError: null
    } );
  } );

  afterEach( ( ) => {
    jest.clearAllMocks( );
  } );

  describe( "when showSavedMatch is true", ( ) => {
    it(
      "renders SavedMatchContainer when observation belongs to current user and is not synced",
      ( ) => {
        const unsyncedLocalObservation = {
          ...mockLocalObservation,
          wasSynced: jest.fn( () => false )
        };

        useLocalObservation.default.mockReturnValue( {
          localObservation: unsyncedLocalObservation,
          markDeletedLocally: jest.fn( ),
          markViewedLocally: jest.fn( )
        } );

        renderComponent( <ObsDetailsDefaultModeScreensWrapper /> );

        expect( screen.getByTestId( "SavedMatch.container" ) ).toBeTruthy( );
        expect( screen.queryByTestId( "ObsDetails.container" ) ).toBeFalsy( );
      }
    );

    it( "renders SavedMatchContainer when observation has no user and is not synced", ( ) => {
      const unsyncedLocalObservationNoUser = factory( "LocalObservation", {
        user: null,
        uuid: "test-123",
        wasSynced: jest.fn( () => false )
      } );

      useLocalObservation.default.mockReturnValue( {
        localObservation: unsyncedLocalObservationNoUser,
        markDeletedLocally: jest.fn( ),
        markViewedLocally: jest.fn( )
      } );

      renderComponent( <ObsDetailsDefaultModeScreensWrapper /> );

      expect( screen.getByTestId( "SavedMatch.container" ) ).toBeTruthy( );
      expect( screen.queryByTestId( "ObsDetails.container" ) ).toBeFalsy( );
    } );
  } );

  describe( "when showSavedMatch is false", ( ) => {
    it( "renders ObsDetailsDefaultModeContainer when observation is synced", ( ) => {
      const syncedLocalObservation = {
        ...mockLocalObservation,
        wasSynced: jest.fn( () => true )
      };

      useLocalObservation.default.mockReturnValue( {
        localObservation: syncedLocalObservation,
        markDeletedLocally: jest.fn( ),
        markViewedLocally: jest.fn( )
      } );

      renderComponent( <ObsDetailsDefaultModeScreensWrapper /> );

      expect( screen.getByTestId( "ObsDetails.container" ) ).toBeTruthy( );
      expect( screen.queryByTestId( "SavedMatch.container" ) ).toBeFalsy( );
    } );

    it(
      "renders ObsDetailsDefaultModeContainer when observation does not belong to current user",
      ( ) => {
        const otherUserObservation = factory( "LocalObservation", {
          user: factory( "LocalUser", {
            id: 456
          } ),
          uuid: "test-123",
          wasSynced: jest.fn( () => false )
        } );

        useLocalObservation.default.mockReturnValue( {
          localObservation: otherUserObservation,
          markDeletedLocally: jest.fn( ),
          markViewedLocally: jest.fn( )
        } );

        renderComponent( <ObsDetailsDefaultModeScreensWrapper /> );

        expect( screen.getByTestId( "ObsDetails.container" ) ).toBeTruthy( );
        expect( screen.queryByTestId( "SavedMatch.container" ) ).toBeFalsy( );
      }
    );
  } );
} );
