import { faker } from "@faker-js/faker";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import DeleteObservationSheet from "components/ObsEdit/Sheets/DeleteObservationSheet";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import inatjs from "inaturalistjs";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

afterEach( ( ) => {
  jest.clearAllMocks( );
} );

const renderDeleteSheet = obs => renderComponent(
  <DeleteObservationSheet
    handleClose={( ) => jest.fn( )}
    navToObsList={( ) => jest.fn( )}
    currentObservation={obs[0]}
    observations={obs}
  />
);

const getLocalObservation = uuid => global.realm
  .objectForPrimaryKey( "Observation", uuid );

describe( "delete observation", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );

    // There's a timer buried somewhere in react-query and this prevents an open handle
    jest.useFakeTimers( );
  } );

  describe( "delete an unsynced observation", ( ) => {
    it( "should delete an observation from realm", async ( ) => {
      const observations = [factory( "LocalObservation", {
        _synced_at: null
      } )];
      global.realm.write( ( ) => {
        global.realm.create( "Observation", observations[0] );
      } );
      const localObservation = getLocalObservation( observations[0].uuid );
      expect( localObservation ).toBeTruthy( );
      renderDeleteSheet( observations );
      const deleteButtonText = i18next.t( "DELETE" );
      const deleteButton = screen.queryByText( deleteButtonText );
      expect( deleteButton ).toBeTruthy( );
      fireEvent.press( deleteButton );
      await waitFor( ( ) => {
        expect( inatjs.observations.delete ).not.toHaveBeenCalled( );
      } );
      expect( getLocalObservation( observations[0].uuid ) ).toBeFalsy( );
    } );
  } );

  describe( "delete a previously synced observation", ( ) => {
    it( "should make a request to observations/delete", async ( ) => {
      const observations = [factory( "LocalObservation", {
        _synced_at: faker.date.past( )
      } )];
      global.realm.write( ( ) => {
        global.realm.create( "Observation", observations[0] );
      } );
      const localObservation = getLocalObservation( observations[0].uuid );
      expect( localObservation ).toBeTruthy( );
      renderDeleteSheet( observations );
      const deleteButtonText = i18next.t( "DELETE" );
      const deleteButton = await screen.findByText( deleteButtonText );
      expect( deleteButton ).toBeTruthy( );
      fireEvent.press( deleteButton );
      await waitFor( ( ) => {
        expect( inatjs.observations.delete ).toHaveBeenCalledTimes( 1 );
      } );
      expect( getLocalObservation( observations[0].uuid ) ).toBeFalsy( );
    } );
  } );

  describe( "cancel deletion", ( ) => {
    it( "should not delete the observation from realm", ( ) => {
      const observations = [factory( "LocalObservation" )];
      global.realm.write( ( ) => {
        global.realm.create( "Observation", observations[0] );
      } );
      const localObservation = getLocalObservation( observations[0].uuid );
      expect( localObservation ).toBeTruthy( );
      renderDeleteSheet( observations );

      const cancelButton = screen.queryByText( /CANCEL/ );
      expect( cancelButton ).toBeTruthy( );
      fireEvent.press( cancelButton );
      expect( getLocalObservation( observations[0].uuid ) ).toBeTruthy( );
    } );
  } );
} );
