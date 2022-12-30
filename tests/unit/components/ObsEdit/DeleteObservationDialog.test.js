import { fireEvent, waitFor } from "@testing-library/react-native";
import DeleteObservationDialog from "components/ObsEdit/DeleteObservationDialog";
import inatjs from "inaturalistjs";
import { ObsEditContext } from "providers/contexts";
import ObsEditProvider from "providers/ObsEditProvider";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

jest.useFakeTimers( );

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
    deleteLocalObservation: ( ) => {
      global.realm.write( ( ) => {
        global.realm.delete( global.realm.objectForPrimaryKey( "Observation", obs[0].uuid ) );
      } );
    }
  }}
  >
    {children}
  </ObsEditContext.Provider>
) );

const renderDeleteDialog = ( ) => renderComponent(
  <ObsEditProvider>
    <DeleteObservationDialog deleteDialogVisible hideDialog={( ) => jest.fn( )} />
  </ObsEditProvider>
);

const getLocalObservation = uuid => global.realm
  .objectForPrimaryKey( "Observation", uuid );

describe( "delete observation", ( ) => {
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
      const { queryByText } = renderDeleteDialog( );
      const deleteButton = queryByText( /Yes-delete-observation/ );
      expect( deleteButton ).toBeTruthy( );
      fireEvent.press( deleteButton );
      expect( getLocalObservation( observations[0].uuid ) ).toBeFalsy( );
    } );

    it( "should not make a request to observations/delete", async ( ) => {
      await waitFor( ( ) => {
        expect( inatjs.observations.delete ).not.toHaveBeenCalled( );
      } );
    } );
  } );

  describe( "delete a previously synced observation", ( ) => {
    it( "should make a request to observations/delete", async ( ) => {
      const observations = [factory( "LocalObservation" )];
      global.realm.write( ( ) => {
        global.realm.create( "Observation", observations[0] );
      } );
      const localObservation = getLocalObservation( observations[0].uuid );
      expect( localObservation ).toBeTruthy( );
      mockObsEditProviderWithObs( observations );
      const { queryByText } = renderDeleteDialog( );
      // TODO: figure out why this needs English text and why the one above needs
      // the generic text. Probably has to do with User object still being stored in global realm
      // between tests
      const deleteButton = queryByText( /delete/ );
      expect( deleteButton ).toBeTruthy( );
      fireEvent.press( deleteButton );
      await waitFor( ( ) => {
        expect( inatjs.observations.delete ).toHaveBeenCalledTimes( 1 );
        expect( getLocalObservation( observations[0].uuid ) ).toBeFalsy( );
      } );
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
      const { queryByText } = renderDeleteDialog( );

      const cancelButton = queryByText( /Cancel/ );
      expect( cancelButton ).toBeTruthy( );
      fireEvent.press( cancelButton );
      expect( getLocalObservation( observations[0].uuid ) ).toBeTruthy( );
    } );
  } );
} );
