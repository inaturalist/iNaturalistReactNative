// These test ensure that My Observation integrates with other systems like
// remote data retrieval and local data persistence

import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { MS_BEFORE_TOOLBAR_RESET } from "components/MyObservations/hooks/useUploadObservations.ts";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer.tsx";
import i18next from "i18next";
import inatjs from "inaturalistjs";
import { flatten } from "lodash";
import React from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { sleep } from "sharedHelpers/util.ts";
import useStore, { zustandStorage } from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderAppWithComponent } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

const mockUnsyncedObservations = [
  factory( "LocalObservation", {
    _synced_at: null,
    observed_on_string: "2024-05-01",
    latitude: 1.2345,
    longitude: 1.2345,
    observationPhotos: [
      factory( "LocalObservationPhoto", {
        photo: {
          url: faker.image.url( ),
          position: 0
        }
      } )
    ]
  } ),
  factory( "LocalObservation", {
    _synced_at: null,
    observed_on_string: "2024-05-02",
    latitude: 1.2345,
    longitude: 1.2345,
    observationPhotos: [
      factory( "LocalObservationPhoto", {
        photo: {
          url: `${faker.image.url( )}/100`,
          position: 0
        }
      } ),
      factory( "LocalObservationPhoto", {
        photo: {
          url: `${faker.image.url( )}/200`,
          position: 1
        }
      } )
    ]
  } )
];

const mockDeletedIds = [
  faker.number.int( ),
  faker.number.int( )
];

jest.mock( "sharedHooks/useFontScale", () => ( {
  __esModule: true,
  default: ( ) => ( { isLargeFontScale: false } )
} ) );

const mockSyncedObservations = [
  factory( "LocalObservation", {
    _synced_at: faker.date.past( ),
    id: mockDeletedIds[0]
  } ),
  factory( "LocalObservation", {
    _synced_at: faker.date.past( )
  } )
];

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  iconUrl: faker.image.url( ),
  locale: "en"
} );

const checkToolbarResetWithUnsyncedObs = ( ) => waitFor( ( ) => {
  const toolbarText = screen.getByText( /Upload 2 observations/ );
  expect( toolbarText ).toBeVisible( );
} );

const writeObservationsToRealm = ( observations, message ) => {
  const realm = global.mockRealms[__filename];
  safeRealmWrite( realm, ( ) => {
    observations.forEach( mockObservation => {
      realm.create( "Observation", mockObservation );
    } );
  }, message );
};

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier
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
      useQuery: ( ) => []
    }
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const firstObservation = mockUnsyncedObservations[0];
const secondObservation = mockUnsyncedObservations[1];

const displayItemByTestId = testId => {
  const item = screen.getByTestId( testId );
  expect( item ).toBeVisible( );
};

const pressItemByTestId = testId => {
  const item = screen.getByTestId( testId );
  expect( item ).toBeVisible( );
  fireEvent.press( item );
};

const displayItemByText = text => {
  const item = screen.getByText( text );
  expect( item ).toBeVisible( );
};

beforeEach( ( ) => {
  useStore.setState( {
    layout: {
      isDefaultMode: false,
      isAllAddObsOptionsMode: true
    }
  } );
} );

describe( "MyObservations", ( ) => {
  // For some reason this interferes with the "should not make a request to
  // users/me" test below, can't figure out why ~~~kueda 20230105
  // TODO: this looks to me more like it should be covered by unit tests - @jtklein
  // describe( "accessibility", ( ) => {
  //   it( "should not have accessibility errors", async ( ) => {
  //     const mockUser = factory( "LocalUser" );
  //     await signIn( mockUser );
  //     const observations = [factory( "RemoteObservation" )];
  //     inatjs.observations.search.mockResolvedValue( makeResponse( observations ) );
  //     renderAppWithComponent( <ObsList /> );
  //     const { findByTestId } = renderAppWithComponent( <ObsList /> );
  //     expect( await screen.findByTestId( "ObservationViews.myObservations" ) ).toBeAccessible( );
  //   } );
  // } );

  describe( "when signed out", ( ) => {
    async function testApiMethodNotCalled( apiMethod ) {
      // Let's make sure the mock hasn't already been used
      expect( apiMethod ).not.toHaveBeenCalled( );
      const realm = global.mockRealms[__filename];
      const signedInUsers = realm.objects( "User" ).filtered( "signedIn == true" );
      expect( signedInUsers.length ).toEqual( 0 );
      renderAppWithComponent( <MyObservationsContainer /> );
      const loginText = i18next.t( "Use-iNaturalist-to-identify-any-living-thing" );
      expect( await screen.findByText( loginText ) ).toBeTruthy( );
      // Unpleasant, but without adjusting the timeout it doesn't seem like
      // all of these requests get caught
      await waitFor( ( ) => {
        expect( apiMethod ).not.toHaveBeenCalled( );
      }, { timeout: 3000, interval: 500 } );
    }
    it( "should not make a request to users/me", async ( ) => {
      await testApiMethodNotCalled( inatjs.users.me );
    } );
    it( "should not make a request to observations/updates", async ( ) => {
      await testApiMethodNotCalled( inatjs.observations.updates );
    } );
  } );

  describe( "when signed in", ( ) => {
    beforeEach( async ( ) => {
      await signIn( mockUser, { realm: global.mockRealms[__filename] } );
      jest.useFakeTimers( );
    } );

    afterEach( async ( ) => {
      await signOut( { realm: global.mockRealms[__filename] } );
    } );

    describe( "with unsynced observations", ( ) => {
      // Mock inatjs endpoints so they return the right responses for the right test data
      inatjs.observations.create.mockImplementation( async ( params, _opts ) => {
        const mockObs = mockUnsyncedObservations.find( o => o.uuid === params.observation.uuid );
        return makeResponse( [{ id: faker.number.int( ), uuid: mockObs.uuid }] );
      } );
      inatjs.observations.fetch.mockImplementation( ( uuid, _params, _opts ) => {
        const mockObs = mockUnsyncedObservations.find( o => o.uuid === uuid );
        // It would be a lot better if this returned something that looks like
        // a remote obs, but this works
        return Promise.resolve( makeResponse( [mockObs] ) );
      } );
      inatjs.observation_photos.create.mockImplementation( async ( params, _opts ) => {
        const mockObsPhotos = flatten( mockUnsyncedObservations.map( o => o.observationPhotos ) );
        const mockObsPhoto = mockObsPhotos.find(
          op => op.uuid === params.observation_photo.uuid
        );
        // Pretend this takes a bit
        await sleep( 500 );
        return makeResponse( [{
          id: faker.number.int( ),
          uuid: mockObsPhoto.uuid
        }] );
      } );
      inatjs.photos.create.mockImplementation( ( ) => Promise.resolve( makeResponse( [{
        id: faker.number.int( )
      }] ) ) );

      beforeEach( ( ) => {
        writeObservationsToRealm(
          mockUnsyncedObservations,
          "writing unsynced observations for MyObservations integration test"
        );
      } );

      it( "displays unuploaded status", async () => {
        const realm = global.mockRealms[__filename];
        expect( realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
        renderAppWithComponent( <MyObservationsContainer /> );
        await checkToolbarResetWithUnsyncedObs( );
        mockUnsyncedObservations.forEach( obs => {
          displayItemByTestId( `UploadIcon.start.${obs.uuid}` );
        } );
      } );

      it( "displays upload in progress status when toolbar tapped", async () => {
        renderAppWithComponent( <MyObservationsContainer /> );
        await checkToolbarResetWithUnsyncedObs( );
        pressItemByTestId( "SyncButton" );
        await waitFor( ( ) => {
          displayItemByText( /Uploading [1-2] of 2 observations/ );
        } );
        displayItemByTestId( `UploadIcon.progress.${secondObservation.uuid}` );
        const secondQueuedObsItem = screen.getByTestId(
          `ObsPressable.${secondObservation.uuid}`
        );
        expect( secondQueuedObsItem ).toBeDisabled( );
        await waitFor( ( ) => {
          displayItemByTestId( `UploadIcon.progress.${firstObservation.uuid}` );
        } );
        const firstQueuedObsItem = screen.getByTestId(
          `ObsPressable.${firstObservation.uuid}`
        );
        expect( firstQueuedObsItem ).toBeDisabled( );
        await waitFor( ( ) => {
          displayItemByText( /2 observations uploaded/ );
        } );
        expect( firstQueuedObsItem ).not.toBeDisabled( );
      } );

      it( "displays upload in progress status when individual upload tapped", async () => {
        renderAppWithComponent( <MyObservationsContainer /> );
        // There are two unuploaded observations, and we are about to upload one of them
        await checkToolbarResetWithUnsyncedObs( );
        pressItemByTestId( `UploadIcon.start.${firstObservation.uuid}` );
        await waitFor( ( ) => {
          // Status reflects that we are only uploading one individual observation
          displayItemByText( /Uploading 1 observation/ );
        } );
        displayItemByTestId( `UploadIcon.progress.${firstObservation.uuid}` );
        const queuedObsItem = screen.getByTestId(
          `ObsPressable.${firstObservation.uuid}`
        );
        expect( queuedObsItem ).toBeDisabled( );
        displayItemByTestId( `UploadIcon.start.${secondObservation.uuid}` );
        const obsItem = screen.getByTestId(
          `ObsPressable.${secondObservation.uuid}`
        );
        expect( obsItem ).not.toBeDisabled( );

        await waitFor( ( ) => {
          displayItemByText( /1 observation uploaded/ );
        } );
        expect( queuedObsItem ).not.toBeDisabled( );
      } );

      it( "shows error when upload network connection fails", async ( ) => {
        renderAppWithComponent( <MyObservationsContainer /> );
        await checkToolbarResetWithUnsyncedObs( );
        inatjs.observations.create.mockRejectedValueOnce(
          new TypeError( "Network request failed" )
        );
        pressItemByTestId( "SyncButton" );
        const toolbarText = await screen.findByText( /1 upload failed/ );
        expect( toolbarText ).toBeVisible( );
        // Wait for the toolbar to reset to its default state so there aren't
        // any pending async processes that will interfere with other tests
        await waitFor( ( ) => {
          displayItemByText( /Upload 1 observation/ );
        }, { timeout: MS_BEFORE_TOOLBAR_RESET + 1000, interval: 500 } );
      } );
    } );

    describe( "with synced observations", ( ) => {
      beforeEach( ( ) => {
        writeObservationsToRealm(
          mockSyncedObservations,
          "MyObservations integration test with synced observations"
        );
      } );

      afterEach( ( ) => {
        jest.clearAllMocks( );
      } );

      it( "should make a request to observations/updates", async ( ) => {
        // Let's make sure the mock hasn't already been used
        // expect( inatjs.observations.updates ).not.toHaveBeenCalled();
        inatjs.observations.updates.mockClear( );
        renderAppWithComponent( <MyObservationsContainer /> );
        expect( await screen.findByText( /OBSERVATIONS/ ) ).toBeTruthy();
        await waitFor( ( ) => {
          expect( inatjs.observations.updates ).toHaveBeenCalled( );
        } );
      } );

      it( "hides observation status in grid view", async () => {
        const realm = global.mockRealms[__filename];
        expect( realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
        renderAppWithComponent( <MyObservationsContainer /> );
        displayItemByTestId( "SyncButton" );
        mockSyncedObservations.forEach( obs => {
          const obsStatus = screen.queryByTestId( `ObsStatus.${obs.uuid}` );
          expect( obsStatus ).toBeFalsy();
        } );
      } );

      it( "renders list view on button press", async () => {
        const realm = global.mockRealms[__filename];
        expect( realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
        renderAppWithComponent( <MyObservationsContainer /> );
        const button = await screen.findByTestId( "SegmentedButton.list" );
        fireEvent.press( button );
        // Awaiting the first observation because using await in the forEach errors out
        const firstObs = mockSyncedObservations[0];
        await screen.findByTestId( `MyObservations.obsListItem.${firstObs.uuid}` );
        mockSyncedObservations.forEach( obs => {
          displayItemByTestId( `MyObservations.obsListItem.${obs.uuid}` );
        } );
      } );

      it( "displays observation status in list view in advanced mode", async () => {
        useStore.setState( {
          layout: {
            isDefaultMode: false,
            isAllAddObsOptionsMode: true
          }
        } );
        const realm = global.mockRealms[__filename];
        expect( realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
        renderAppWithComponent( <MyObservationsContainer /> );
        const syncIcon = await screen.findByTestId( "SyncButton" );
        await waitFor( () => {
          expect( syncIcon ).toBeVisible();
        } );
        mockSyncedObservations.forEach( obs => {
          displayItemByTestId( `ObsStatus.${obs.uuid}` );
        } );
      } );

      it( "doesn't throw an error when sync button tapped", async ( ) => {
        const realm = global.mockRealms[__filename];
        expect( realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
        renderAppWithComponent( <MyObservationsContainer /> );
        const syncIcon = await screen.findByTestId( "SyncButton" );
        await waitFor( ( ) => {
          expect( syncIcon ).toBeVisible( );
        } );
        expect( ( ) => {
          fireEvent.press( syncIcon );
        } ).not.toThrow( );
      } );

      it( "should trigger manual observation sync on pull-to-refresh", async ( ) => {
        renderAppWithComponent( <MyObservationsContainer /> );

        const myObsList = await screen.findByTestId( "MyObservationsAnimatedList" );

        fireEvent.scroll( myObsList, {
          nativeEvent: {
            contentOffset: { y: -100 },
            contentSize: { height: 1000, width: 100 },
            layoutMeasurement: { height: 500, width: 100 }
          }
        } );

        expect( inatjs.observations.deleted ).toHaveBeenCalled( );
      } );

      describe( "on screen focus", ( ) => {
        beforeEach( ( ) => {
          zustandStorage.setItem( "lastDeletedSyncTime", "2024-05-01" );
        } );

        it( "downloads deleted observations from server when screen focused", async ( ) => {
          const realm = global.mockRealms[__filename];
          expect( realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
          renderAppWithComponent( <MyObservationsContainer /> );
          await waitFor( ( ) => {
            expect( inatjs.observations.deleted ).toHaveBeenCalledWith(
              {
                since: "2024-05-01"
              },
              expect.anything( )
            );
          } );
        } );

        it( "deletes local observations if they have been deleted on server", async ( ) => {
          inatjs.observations.deleted.mockResolvedValue( makeResponse( mockDeletedIds ) );
          renderAppWithComponent( <MyObservationsContainer /> );
          const deleteSpy = jest.spyOn( global.mockRealms[__filename], "delete" );
          await waitFor( ( ) => {
            expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
          } );
          expect( global.mockRealms[__filename].objects( "Observation" ).length ).toBe( 1 );
        } );
      } );
    } );

    describe( "with no observations", ( ) => {
      it( "should show AI camera button to create first observation", async ( ) => {
        renderAppWithComponent( <MyObservationsContainer /> );
        await waitFor( ( ) => {
          const aiCameraButton = screen.getByTestId( "add-obs-button" );
          expect( aiCameraButton ).toBeVisible( );
        } );
      } );
    } );
    // TODO there are different presentations for each of these states
    // describe( "with 1 observation" );
    // describe( "with 25 observations" );
    // describe( "with 75 observations" );
    // describe( "with 125 observations" );
  } );
} );
