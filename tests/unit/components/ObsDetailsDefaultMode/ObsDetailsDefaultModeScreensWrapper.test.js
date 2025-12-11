import { screen } from "@testing-library/react-native";
import ObsDetailsDefaultModeScreensWrapper
  from "components/ObsDetailsDefaultMode/ObsDetailsDefaultModeScreensWrapper";
import React from "react";
import * as useLocalObservation from "sharedHooks/useLocalObservation";
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

jest.mock( "@react-native-community/netinfo", () => ( {
  useNetInfo: () => ( { isConnected: true } ),
  configure: jest.fn( )
} ) );

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => mockCurrentUser
} ) );
jest.mock( "sharedHooks/useLocalObservation", () => ( {
  __esModule: true,
  default: jest.fn( () => ( {
    localObservation: null
  } ) )
} ) );
jest.mock( "sharedHooks/useRemoteObservation", ( ) => ( {
  __esModule: true,
  default: ( _uuid, _fetchRemoteEnabled ) => ( {
    remoteObservation: null,
    refetchRemoteObservation: jest.fn( ),
    isRefetching: false,
    fetchRemoteObservationError: null
  } )
} ) );

describe( "ObsDetailsDefaultModeScreensWrapper", ( ) => {
  describe( "when showSavedMatch is true", ( ) => {
    it(
      "renders SavedMatchContainer when observation belongs to current user and is not synced",
      ( ) => {
        const unsyncedLocalObservation = {
          ...mockLocalObservation,
          wasSynced: jest.fn( () => false )
        };

        jest.spyOn( useLocalObservation, "default" ).mockImplementation( () => ( {
          localObservation: unsyncedLocalObservation,
          markDeletedLocally: jest.fn( ),
          markViewedLocally: jest.fn( )
        } ) );

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

      jest.spyOn( useLocalObservation, "default" ).mockImplementation( () => ( {
        localObservation: unsyncedLocalObservationNoUser,
        markDeletedLocally: jest.fn( ),
        markViewedLocally: jest.fn( )
      } ) );

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

      jest.spyOn( useLocalObservation, "default" ).mockImplementation( () => ( {
        localObservation: syncedLocalObservation,
        markDeletedLocally: jest.fn( ),
        markViewedLocally: jest.fn( )
      } ) );

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

        jest.spyOn( useLocalObservation, "default" ).mockImplementation( () => ( {
          localObservation: otherUserObservation,
          markDeletedLocally: jest.fn( ),
          markViewedLocally: jest.fn( )
        } ) );

        renderComponent( <ObsDetailsDefaultModeScreensWrapper /> );

        expect( screen.getByTestId( "ObsDetails.container" ) ).toBeTruthy( );
        expect( screen.queryByTestId( "SavedMatch.container" ) ).toBeFalsy( );
      }
    );
  } );
} );
