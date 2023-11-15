import { faker } from "@faker-js/faker";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import DeleteObservationSheet from "components/ObsEdit/Sheets/DeleteObservationSheet";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import inatjs from "inaturalistjs";
import { ObsEditContext } from "providers/contexts";
import ObsEditProvider from "providers/ObsEditProvider";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

beforeEach( async ( ) => {
  global.realm.write( ( ) => {
    global.realm.deleteAll( );
  } );
} );

afterEach( ( ) => {
  jest.clearAllMocks( );
} );

jest.mock( "providers/ObsEditProvider" );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      navigate: jest.fn( )
    } )
  };
} );

// Mock ObservationProvider so it provides a specific array of observations
// without any current observation or ability to update or fetch
// observations
const mockObsEditProviderWithObs = obs => ObsEditProvider.mockImplementation( ( { children } ) => (
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  <ObsEditContext.Provider value={{
    currentObservation: obs[0],
    observations: obs
  }}
  >
    {children}
  </ObsEditContext.Provider>
) );

const renderDeleteSheet = ( ) => renderComponent(
  <ObsEditProvider>
    <DeleteObservationSheet
      handleClose={( ) => jest.fn( )}
      navToObsList={( ) => jest.fn( )}
    />
  </ObsEditProvider>
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
      mockObsEditProviderWithObs( observations );
      renderDeleteSheet( );
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
      mockObsEditProviderWithObs( observations );
      renderDeleteSheet( );
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
      mockObsEditProviderWithObs( observations );
      renderDeleteSheet( );

      const cancelButton = screen.queryByText( /CANCEL/ );
      expect( cancelButton ).toBeTruthy( );
      fireEvent.press( cancelButton );
      expect( getLocalObservation( observations[0].uuid ) ).toBeTruthy( );
    } );
  } );
} );
