import { faker } from "@faker-js/faker";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import DeleteObservationSheet from "components/ObsEdit/Sheets/DeleteObservationSheet";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import inatjs from "inaturalistjs";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const observations = [factory( "LocalObservation", {
  _deleted_at: null
} )];

const currentObservation = observations[0];

afterEach( ( ) => {
  jest.clearAllMocks( );
} );

const mockNavigate = jest.fn( );

const renderDeleteSheet = ( ) => renderComponent(
  <DeleteObservationSheet
    navToObsList={mockNavigate}
    currentObservation={currentObservation}
    observations={observations}
  />
);

const getLocalObservation = uuid => global.realm
  .objectForPrimaryKey( "Observation", uuid );

describe( "delete observation", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );

    global.realm.write( ( ) => {
      global.realm.create( "Observation", currentObservation );
    } );
  } );

  describe( "add observation to deletion queue", ( ) => {
    it( "should handle adding _deleted_at date in realm", async ( ) => {
      const localObservation = getLocalObservation( currentObservation.uuid );
      expect( localObservation ).toBeTruthy( );
      renderDeleteSheet( );
      const deleteButtonText = i18next.t( "DELETE" );
      const deleteButton = screen.queryByText( deleteButtonText );
      fireEvent.press( deleteButton );
      await waitFor( ( ) => {
        expect( inatjs.observations.delete ).not.toHaveBeenCalled( );
      } );
      expect( localObservation._deleted_at ).toBeTruthy( );
    } );
  } );

  describe( "cancel deletion", ( ) => {
    it( "should not add _deleted_at date in realm", ( ) => {
      const localObservation = getLocalObservation( currentObservation.uuid );
      global.realm.write( ( ) => {
        localObservation._deleted_at = null;
      } );
      expect( localObservation ).toBeTruthy( );
      renderDeleteSheet( );
      const cancelButton = screen.queryByText( /CANCEL/ );
      fireEvent.press( cancelButton );
      expect( localObservation._deleted_at ).toBeNull( );
    } );
  } );

  describe( "handles multiple observation deletion", ( ) => {
    it( "navigates back to MyObservations when observations are not in realm", ( ) => {
      const unsavedObservations = [{
        uuid: faker.string.uuid( )
      }, {
        uuid: faker.string.uuid( )
      }];
      renderComponent(
        <DeleteObservationSheet
          navToObsList={mockNavigate}
          currentObservation={unsavedObservations[0]}
          observations={unsavedObservations}
        />
      );
      const deleteButton = screen.queryByText( /DELETE ALL/ );
      fireEvent.press( deleteButton );
      expect( mockNavigate ).toBeCalled( );
    } );
  } );
} );
