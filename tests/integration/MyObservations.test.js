// These test ensure that My Observation integrates with other systems like
// remote data retrieval and local data persistence

import faker from "tests/helpers/faker";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import { format } from "date-fns";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import inatjs from "inaturalistjs";
import React from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import factory, { makeResponse } from "tests/factory";
import { renderAppWithComponent } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

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
      useRealm: ( ) => global.mockRealms[mockRealmIdentifier]
    }
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

describe( "MyObservations", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

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
      const loginText = i18next.t( "Log-in-to-contribute-your-observations" );
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
    const mockUser = factory( "LocalUser", {
      login: faker.internet.userName( ),
      iconUrl: faker.image.url( ),
      locale: "en"
    } );

    beforeEach( async ( ) => {
      await signIn( mockUser, { realm: global.mockRealms[__filename] } );
    } );

    afterEach( ( ) => {
      signOut( { realm: global.mockRealms[__filename] } );
    } );

    describe( "with unsynced observations", ( ) => {
      const mockObservations = [
        factory( "LocalObservation", {
          _synced_at: null,
          observationPhotos: [
            factory( "LocalObservationPhoto", {
              photo: {
                id: faker.number.int( ),
                url: faker.image.url( ),
                position: 0
              }
            } )
          ]
        } ),
        factory( "LocalObservation", {
          _synced_at: null,
          observationPhotos: [
            factory( "LocalObservationPhoto", {
              photo: {
                id: faker.number.int( ),
                url: `${faker.image.url( )}/100`,
                position: 0
              }
            } ),
            factory( "LocalObservationPhoto", {
              photo: {
                id: faker.number.int( ),
                url: `${faker.image.url( )}/200`,
                position: 1
              }
            } )
          ]
        } )
      ];

      beforeEach( ( ) => {
        // Write local observation to Realm
        safeRealmWrite( global.mockRealms[__filename], ( ) => {
          mockObservations.forEach( mockObservation => {
            global.mockRealms[__filename].create( "Observation", mockObservation );
          } );
        }, "write local observation, MyObservations integration test with unsynced observations" );
      } );

      it( "should make a request to observations/updates", async ( ) => {
        // Let's make sure the mock hasn't already been used
        expect( inatjs.observations.updates ).not.toHaveBeenCalled();
        renderAppWithComponent( <MyObservationsContainer /> );
        expect( await screen.findByText( /Welcome back/ ) ).toBeTruthy();
        await waitFor( ( ) => {
          expect( inatjs.observations.updates ).toHaveBeenCalled( );
        } );
      } );

      it( "renders grid view on button press", async () => {
        const realm = global.mockRealms[__filename];
        expect( realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
        renderAppWithComponent( <MyObservationsContainer /> );
        const button = await screen.findByTestId( "MyObservationsToolbar.toggleGridView" );
        fireEvent.press( button );
        // Awaiting the first observation because using await in the forEach errors out
        const firstObs = mockObservations[0];
        await screen.findByTestId( `MyObservations.gridItem.${firstObs.uuid}` );
        mockObservations.forEach( obs => {
          expect( screen.getByTestId( `MyObservations.gridItem.${obs.uuid}` ) ).toBeTruthy();
        } );
      } );

      it( "displays unuploaded status", async () => {
        const realm = global.mockRealms[__filename];
        expect( realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
        renderAppWithComponent( <MyObservationsContainer /> );
        await waitFor( ( ) => {
          const toolbarText = screen.getByText( /Upload 2 observations/ );
          expect( toolbarText ).toBeVisible( );
        } );
        mockObservations.forEach( obs => {
          const uploadIcon = screen.getByTestId( `UploadIcon.start.${obs.uuid}` );
          expect( uploadIcon ).toBeVisible( );
        } );
      } );

      it( "displays upload in progress status when individual upload tapped", async () => {
        renderAppWithComponent( <MyObservationsContainer /> );
        await waitFor( ( ) => {
          const toolbarText = screen.getByText( /Upload 2 observations/ );
          expect( toolbarText ).toBeVisible( );
        } );
        const uploadIcon = screen.getByTestId( `UploadIcon.start.${mockObservations[0].uuid}` );
        expect( uploadIcon ).toBeVisible( );
        fireEvent.press( uploadIcon );
        await waitFor( ( ) => {
          const uploadInProgressText = screen.getByText( /Uploading 1 of 1 observation/ );
          expect( uploadInProgressText ).toBeVisible( );
        } );
        const uploadInProgressIcon = screen.getByTestId(
          `UploadIcon.progress.${mockObservations[0].uuid}`
        );
        expect( uploadInProgressIcon ).toBeVisible( );
        const secondUploadIcon = screen.getByTestId(
          `UploadIcon.start.${mockObservations[1].uuid}`
        );
        expect( secondUploadIcon ).toBeVisible( );
        await waitFor( ( ) => {
          const toolbarText = screen.getByText( /1 observation uploaded/ );
          expect( toolbarText ).toBeVisible( );
        } );
      } );

      it( "displays upload in progress status when toolbar tapped", async () => {
        renderAppWithComponent( <MyObservationsContainer /> );
        await waitFor( ( ) => {
          const toolbarText = screen.getByText( /Upload 2 observations/ );
          expect( toolbarText ).toBeVisible( );
        } );
        const syncIcon = screen.getByTestId( "SyncButton" );
        expect( syncIcon ).toBeVisible( );
        fireEvent.press( syncIcon );
        await waitFor( ( ) => {
          const uploadInProgressText = screen.getByText( /Uploading 1 of 2 observations/ );
          expect( uploadInProgressText ).toBeVisible( );
        } );
        mockObservations.forEach( obs => {
          const uploadInProgressIcon = screen.getByTestId( `UploadIcon.progress.${obs.uuid}` );
          expect( uploadInProgressIcon ).toBeVisible( );
        } );
        await waitFor( ( ) => {
          const toolbarText = screen.getByText( /2 observations uploaded/ );
          expect( toolbarText ).toBeVisible( );
        } );
      } );
    } );

    describe( "with synced observations", ( ) => {
      const mockDeletedIds = [
        faker.number.int( ),
        faker.number.int( )
      ];

      const mockObservationsSynced = [
        factory( "LocalObservation", {
          _synced_at: faker.date.past( ),
          id: mockDeletedIds[0]
        } ),
        factory( "LocalObservation", {
          _synced_at: faker.date.past( )
        } )
      ];

      beforeEach( ( ) => {
        safeRealmWrite( global.mockRealms[__filename], ( ) => {
          global.mockRealms[__filename].deleteAll( );
          mockObservationsSynced.forEach( mockObservation => {
            global.mockRealms[__filename].create( "Observation", mockObservation );
          } );
        }, "delete all and create synced observations, MyObservations integration test" );
      } );

      afterEach( ( ) => {
        jest.clearAllMocks( );
      } );

      it( "displays observation status", async () => {
        const realm = global.mockRealms[__filename];
        expect( realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
        renderAppWithComponent( <MyObservationsContainer /> );
        const syncIcon = await screen.findByTestId( "SyncButton" );
        await waitFor( ( ) => {
          expect( syncIcon ).toBeVisible( );
        } );
        mockObservationsSynced.forEach( obs => {
          const obsStatus = screen.getByTestId( `ObsStatus.${obs.uuid}` );
          expect( obsStatus ).toBeVisible( );
        } );
      } );

      describe( "before initial sync", ( ) => {
        it( "doesn't throw an error when sync button tapped", async ( ) => {
          const realm = global.mockRealms[__filename];
          expect( realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
          expect( realm.objects( "LocalPreferences" )[0] ).toBeFalsy( );
          renderAppWithComponent( <MyObservationsContainer /> );
          const syncIcon = await screen.findByTestId( "SyncButton" );
          await waitFor( ( ) => {
            expect( syncIcon ).toBeVisible( );
          } );
          expect( ( ) => {
            fireEvent.press( syncIcon );
          } ).not.toThrow( );
        } );
      } );

      describe( "after initial sync", ( ) => {
        beforeEach( ( ) => {
          safeRealmWrite( global.mockRealms[__filename], ( ) => {
            global.mockRealms[__filename].create( "LocalPreferences", {
              last_sync_time: new Date( "2023-11-01" )
            } );
          }, "add last_sync_time to LocalPreferences, MyObservations integration test" );
        } );

        it( "downloads deleted observations from server when sync button tapped", async ( ) => {
          const realm = global.mockRealms[__filename];
          expect( realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
          renderAppWithComponent( <MyObservationsContainer /> );
          const syncIcon = await screen.findByTestId( "SyncButton" );
          await waitFor( ( ) => {
            expect( syncIcon ).toBeVisible( );
          } );
          fireEvent.press( syncIcon );
          const lastSyncTime = realm.objects( "LocalPreferences" )[0].last_sync_time;
          await waitFor( ( ) => {
            expect( inatjs.observations.deleted ).toHaveBeenCalledWith(
              {
                since: format( lastSyncTime, "yyyy-MM-dd" )
              },
              expect.anything( )
            );
          } );
        } );

        it( "deletes local observations if they have been deleted on server", async ( ) => {
          inatjs.observations.deleted.mockResolvedValue( makeResponse( mockDeletedIds ) );
          renderAppWithComponent( <MyObservationsContainer /> );
          const syncIcon = await screen.findByTestId( "SyncButton" );
          await waitFor( ( ) => {
            expect( syncIcon ).toBeVisible( );
          } );
          fireEvent.press( syncIcon );
          const deleteSpy = jest.spyOn( global.mockRealms[__filename], "delete" );
          await waitFor( ( ) => {
            expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
          } );
          expect( global.mockRealms[__filename].objects( "Observation" ).length ).toBe( 1 );
        } );
      } );
    } );
  } );

  describe( "localization for current user", ( ) => {
    // beforeEach( ( ) => {
    //   safeRealmWrite( global.mockRealms[__filename], ( ) => {
    //     global.mockRealms[__filename].deleteAll( );
    //   }, "delete all, MyObservations integration test, localization for current user" );
    // } );

    // afterEach( ( ) => {
    //   jest.clearAllMocks( );
    // } );
    afterEach( async ( ) => {
      signOut( { realm: global.mockRealms[__filename] } );
    } );
    it( "should be English by default", async ( ) => {
      const mockUser = factory( "LocalUser", {
        login: faker.internet.userName( ),
        iconUrl: faker.image.url( ),
        locale: "en"
      } );
      expect( mockUser.locale ).toEqual( "en" );
      await signIn( mockUser, { realm: global.mockRealms[__filename] } );
      renderAppWithComponent( <MyObservationsContainer /> );
      await waitFor( ( ) => {
        expect( screen.getByText( /Welcome back/ ) ).toBeTruthy( );
      } );
      expect( screen.queryByText( /Welcome-user/ ) ).toBeFalsy( );
    } );

    it( "should be Spanish if signed in user's locale is Spanish", async ( ) => {
      const mockSpanishUser = factory( "LocalUser", {
        login: faker.internet.userName( ),
        iconUrl: faker.image.url( ),
        locale: "es"
      } );
      expect( mockSpanishUser.locale ).toEqual( "es" );
      await signIn( mockSpanishUser, { realm: global.mockRealms[__filename] } );
      renderAppWithComponent( <MyObservationsContainer /> );
      await waitFor( ( ) => {
        expect( screen.getByText( /Bienvenido a iNaturalist/ ) ).toBeTruthy();
      } );
      expect( screen.queryByText( /Welcome/ ) ).toBeFalsy( );
    } );

    it(
      "should change to es when local user locale is en but remote user locale is es",
      async ( ) => {
        const mockUser = factory( "LocalUser", {
          login: faker.internet.userName( ),
          iconUrl: faker.image.url( ),
          locale: "en"
        } );
        expect( mockUser.locale ).toEqual( "en" );
        await signIn( mockUser, { realm: global.mockRealms[__filename] } );

        const mockSpanishUser = factory( "LocalUser", {
          locale: "es"
        } );
        inatjs.users.me.mockResolvedValue( makeResponse( [mockSpanishUser] ) );

        renderAppWithComponent( <MyObservationsContainer /> );
        // I'd prefer to wait for the Spanish text to appear, but that never
        // seems to wait long enough. This waits for the relevant API call to
        // have been made
        await waitFor( ( ) => {
          expect( inatjs.users.me ).toHaveBeenCalled( );
        } );
        expect( screen.getByText( /Bienvenido a iNaturalist/ ) ).toBeTruthy( );
        expect( screen.queryByText( /Welcome/ ) ).toBeFalsy( );
      }
    );
  } );
} );
