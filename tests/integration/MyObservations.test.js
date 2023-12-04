// These test ensure that My Observation integrates with other systems like
// remote data retrieval and local data persistence

import { faker } from "@faker-js/faker";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import { format } from "date-fns";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import inatjs from "inaturalistjs";
import React from "react";

import factory, { makeResponse } from "../factory";
import { renderAppWithComponent } from "../helpers/render";
import { signIn, signOut } from "../helpers/user";

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
    beforeEach( async ( ) => {
      await global.realm.write( ( ) => {
        global.realm.deleteAll( );
      } );
    } );

    afterEach( ( ) => {
      jest.clearAllMocks( );
    } );

    async function testApiMethodNotCalled( apiMethod ) {
      // Let's make sure the mock hasn't already been used
      expect( apiMethod ).not.toHaveBeenCalled( );
      const signedInUsers = global.realm.objects( "User" ).filtered( "signedIn == true" );
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
      await global.realm.write( ( ) => {
        global.realm.deleteAll( );
      } );
      await signIn( mockUser );
    } );

    afterEach( ( ) => {
      jest.clearAllMocks( );
      signOut( );
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

      beforeEach( async () => {
        // Write local observation to Realm
        await global.realm.write( () => {
          mockObservations.forEach( mockObservation => {
            global.realm.create( "Observation", mockObservation );
          } );
        } );
      } );

      afterEach( ( ) => {
        jest.clearAllMocks( );
      } );

      it( "should make a request to observations/updates", async ( ) => {
        // Let's make sure the mock hasn't already been used
        expect( inatjs.observations.updates ).not.toHaveBeenCalled();
        renderAppWithComponent( <MyObservationsContainer /> );
        expect( await screen.findByText( /Welcome back/ ) ).toBeTruthy();
        expect( inatjs.observations.updates ).toHaveBeenCalled();
      } );

      it( "renders grid view on button press", async () => {
        expect( global.realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
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
        expect( global.realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
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

      beforeEach( async () => {
        await global.realm.write( () => {
          global.realm.deleteAll( );
          mockObservationsSynced.forEach( mockObservation => {
            global.realm.create( "Observation", mockObservation );
          } );
        } );
      } );

      afterEach( ( ) => {
        jest.clearAllMocks( );
      } );

      it( "displays observation status", async () => {
        expect( global.realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
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
          expect( global.realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
          expect( global.realm.objects( "LocalPreferences" )[0] ).toBeFalsy( );
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
        beforeEach( async () => {
          await global.realm.write( () => {
            global.realm.create( "LocalPreferences", {
              last_sync_time: new Date( "2023-11-01" )
            } );
          } );
        } );

        it( "downloads deleted observations from server when sync button tapped", async ( ) => {
          expect( global.realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
          renderAppWithComponent( <MyObservationsContainer /> );
          const syncIcon = await screen.findByTestId( "SyncButton" );
          await waitFor( ( ) => {
            expect( syncIcon ).toBeVisible( );
          } );
          fireEvent.press( syncIcon );
          const lastSyncTime = global.realm.objects( "LocalPreferences" )[0].last_sync_time;
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
          const spy = jest.spyOn( global.realm, "write" );
          const deleteSpy = jest.spyOn( global.realm, "delete" );
          await waitFor( ( ) => {
            expect( spy ).toHaveBeenCalled( );
          } );
          expect( deleteSpy ).toHaveBeenCalled( );
          expect( global.realm.objects( "Observation" ).length ).toBe( 1 );
        } );
      } );
    } );
  } );

  describe( "localization for current user", ( ) => {
    beforeEach( async ( ) => {
      await global.realm.write( ( ) => {
        global.realm.deleteAll( );
      } );
    } );

    afterEach( ( ) => {
      jest.clearAllMocks( );
    } );
    it( "should be English by default", async ( ) => {
      const mockUser = factory( "LocalUser", {
        login: faker.internet.userName( ),
        iconUrl: faker.image.url( ),
        locale: "en"
      } );
      expect( mockUser.locale ).toEqual( "en" );
      await signIn( mockUser );
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
      await signIn( mockSpanishUser );
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
        await signIn( mockUser );

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
