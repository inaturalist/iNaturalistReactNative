import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import {
  adjustIconicTaxaObservationCount,
} from "components/MyObservations/hooks/useIconicTaxaObservationCounts";
import DeleteObservationSheet from "components/ObsEdit/Sheets/DeleteObservationSheet";
import i18next from "i18next";
import inatjs from "inaturalistjs";
import React from "react";
import { ICONIC_TAXA_GROUP } from "sharedHelpers/iconicTaxaGroupOrder";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

jest.mock( "components/MyObservations/hooks/useIconicTaxaObservationCounts", ( ) => ( {
  __esModule: true,
  adjustIconicTaxaObservationCount: jest.fn( ),
} ) );

const observations = [factory( "LocalObservation", {
  _deleted_at: null,
} )];

const currentObservation = observations[0];

const mockUpdateObservations = jest.fn( );

afterEach( ( ) => {
  jest.clearAllMocks( );
} );

const mockNavigate = jest.fn( );

const renderDeleteSheet = ( ) => renderComponent(
  <DeleteObservationSheet
    onPressClose={jest.fn( )}
    onDelete={() => mockNavigate( )}
    currentObservation={currentObservation}
    observations={observations}
    updateObservations={mockUpdateObservations}
  />,
);

const getLocalObservation = uuid => global.realm
  .objectForPrimaryKey( "Observation", uuid );

describe( "delete observation", ( ) => {
  beforeAll( async ( ) => {
    safeRealmWrite( global.realm, ( ) => {
      global.realm.create( "Observation", currentObservation );
    }, "write Observation, DeleteObservationSheet test" );
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
      safeRealmWrite( global.realm, ( ) => {
        localObservation._deleted_at = null;
      }, "set _deleted_at to null, DeleteObservationSheet test" );
      expect( localObservation ).toBeTruthy( );
      renderDeleteSheet( );
      const cancelButton = screen.queryByText( /CANCEL/ );
      fireEvent.press( cancelButton );
      expect( localObservation._deleted_at ).toBeNull( );
    } );
  } );

  it( "navigates back when there's only one observation", ( ) => {
    expect( observations.length ).toEqual( 1 );
    renderDeleteSheet( );
    const deleteButton = screen.queryByText( "DELETE" );
    fireEvent.press( deleteButton );
    expect( mockNavigate ).toBeCalled( );
  } );

  describe( "small grid header counts", ( ) => {
    const renderSheetFor = observation => {
      safeRealmWrite( global.realm, ( ) => {
        global.realm.create( "Observation", observation );
      }, "write Observation, DeleteObservationSheet counts test" );
      renderComponent(
        <DeleteObservationSheet
          onPressClose={jest.fn( )}
          onDelete={jest.fn( )}
          currentObservation={observation}
          observations={[observation]}
          updateObservations={mockUpdateObservations}
        />,
      );
      fireEvent.press( screen.getByText( "DELETE" ) );
    };

    it( "lowers the count of the deleted observation's category when it had been "
      + "uploaded", ( ) => {
      renderSheetFor( factory( "LocalObservation", {
        _deleted_at: null,
        _synced_at: new Date( ),
        taxon: factory( "LocalTaxon", { iconic_taxon_name: ICONIC_TAXA_GROUP.AVES } ),
      } ) );

      expect( adjustIconicTaxaObservationCount ).toHaveBeenCalledWith(
        expect.anything( ),
        undefined,
        ICONIC_TAXA_GROUP.AVES,
        -1,
      );
    } );

    it( "leaves the counts alone for an observation that was never uploaded, since the "
      + "server never counted it", ( ) => {
      renderSheetFor( factory( "LocalObservation", {
        _deleted_at: null,
        _synced_at: null,
      } ) );

      expect( adjustIconicTaxaObservationCount ).not.toHaveBeenCalled( );
    } );
  } );

  describe( "with multiple observations", ( ) => {
    const unsavedObservations = [
      factory( "LocalObservation" ),
      factory( "LocalObservation" ),
    ];

    function renderDeleteSheetWithMultiple( ) {
      renderComponent(
        <DeleteObservationSheet
          onPressClose={jest.fn( )}
          navToObsList={mockNavigate}
          currentObservation={unsavedObservations[0]}
          observations={unsavedObservations}
          updateObservations={mockUpdateObservations}
        />,
      );
    }

    it( "does not navigate back when there's more than one observation", ( ) => {
      renderDeleteSheetWithMultiple( );
      const deleteButton = screen.queryByText( "DELETE" );
      fireEvent.press( deleteButton );
      expect( mockNavigate ).not.toBeCalled( );
    } );

    it( "removes observation from state when there's more than one observation", ( ) => {
      renderDeleteSheetWithMultiple( );
      const deleteButton = screen.queryByText( "DELETE" );
      fireEvent.press( deleteButton );
      expect( mockUpdateObservations ).toBeCalledWith( [unsavedObservations[1]] );
    } );
  } );
} );
