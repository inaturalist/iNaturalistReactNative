import { useNetInfo } from "@react-native-community/netinfo";
import { screen, userEvent } from "@testing-library/react-native";
import BottomButtonsContainer from "components/ObsEdit/BottomButtonsContainer";
import React from "react";
import * as useCurrentUser from "sharedHooks/useCurrentUser";
import useStore from "stores/useStore";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockObservation = factory( "LocalObservation", {
  _synced_at: faker.date.past( ),
} );

const mockUser = factory( "LocalUser" );

const mockStartUploadsFromMultiObsEdit = jest.fn( );

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: ( ) => null,
} ) );

jest.mock( "components/MyObservations/hooks/useUploadObservations", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    startUploadObservations: jest.fn( ),
    startUploadsFromMultiObsEdit: mockStartUploadsFromMultiObsEdit,
  } ),
} ) );

// Exiting the flow resets the navigation stack, which isn't mounted here
jest.mock( "sharedHooks/useExitObservationFlow", ( ) => ( {
  __esModule: true,
  default: ( ) => ( ) => undefined,
} ) );

function renderBottomButtonsContainer( props = {} ) {
  return renderComponent(
    <BottomButtonsContainer
      passesEvidenceTest
      observations={[]}
      currentObservation={mockObservation}
      currentObservationIndex={0}
      setCurrentObservationIndex={0}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      transitionAnimation={() => {}}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />,
  );
}

describe( "BottomButtonsContainer", () => {
  it( "has no accessibility errors", () => {
    // Disabled during the update to RN 0.78
    // expect(
    //   <BottomButtonsContainer
    //     passesEvidenceTest
    //     observations={[]}
    //     currentObservation={mockObservation}
    //     currentObservationIndex={0}
    //     setCurrentObservationIndex={0}
    //     // eslint-disable-next-line @typescript-eslint/no-empty-function
    //     transitionAnimation={() => {}}
    //     // eslint-disable-next-line react/jsx-props-no-spreading
    //   />
    // ).toBeAccessible();
  } );

  it( "shows save button when user is logged out", () => {
    renderBottomButtonsContainer();

    const save = screen.getByText( /SAVE/ );

    expect( save ).toBeVisible( );
  } );

  it( "shows save changes button when user logged in and observation was previously synced", () => {
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( ( ) => mockUser );
    renderBottomButtonsContainer( );

    const saveChanges = screen.getByText( /SAVE CHANGES/ );

    expect( saveChanges ).toBeVisible( );
  } );

  it( "shows save and upload button when user logged in with new observation", () => {
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( ( ) => mockUser );
    renderBottomButtonsContainer( {
      currentObservation: factory( "LocalObservation" ),
    } );

    const save = screen.getByText( /SAVE/ );
    expect( save ).toBeVisible( );
    const upload = screen.getByText( /UPLOAD/ );
    expect( upload ).toBeVisible( );
  } );

  describe( "saving an already uploaded observation", ( ) => {
    const actor = userEvent.setup( );

    beforeEach( ( ) => {
      jest.spyOn( useCurrentUser, "default" ).mockImplementation( ( ) => mockUser );
      useNetInfo.mockReturnValue( { isConnected: true } );
      mockStartUploadsFromMultiObsEdit.mockClear( );
      // addToUploadQueue mutates the queue in place, which outlives the
      // zustand reset between tests, so start each one from a fresh array
      useStore.setState( { uploadQueue: [] } );
    } );

    afterEach( ( ) => {
      useNetInfo.mockReturnValue( { isConnected: true } );
    } );

    async function saveObservationWithButton( observation, testID ) {
      renderBottomButtonsContainer( {
        currentObservation: observation,
        observations: [observation],
        setCurrentObservationIndex: jest.fn( ),
      } );
      await actor.press( screen.getByTestId( testID ) );
    }

    it( "uploads immediately when an edited synced observation is saved", async ( ) => {
      useStore.setState( { unsavedChanges: true } );

      await saveObservationWithButton( mockObservation, "ObsEdit.saveChangesButton" );

      expect( useStore.getState( ).uploadQueue ).toEqual( [mockObservation.uuid] );
      expect( mockStartUploadsFromMultiObsEdit ).toHaveBeenCalled( );
    } );

    it( "does not upload an edited synced observation while offline", async ( ) => {
      useNetInfo.mockReturnValue( { isConnected: false } );
      useStore.setState( { unsavedChanges: true } );

      await saveObservationWithButton( mockObservation, "ObsEdit.saveButton" );

      expect( useStore.getState( ).uploadQueue ).toHaveLength( 0 );
      expect( mockStartUploadsFromMultiObsEdit ).not.toHaveBeenCalled( );
    } );

    it( "does not upload a synced observation that was not edited", async ( ) => {
      useStore.setState( { unsavedChanges: false } );

      await saveObservationWithButton( mockObservation, "ObsEdit.saveChangesButton" );

      expect( useStore.getState( ).uploadQueue ).toHaveLength( 0 );
      expect( mockStartUploadsFromMultiObsEdit ).not.toHaveBeenCalled( );
    } );

    it( "does not upload an edited observation that was never synced", async ( ) => {
      useStore.setState( { unsavedChanges: true } );

      await saveObservationWithButton(
        factory( "LocalObservation" ),
        "ObsEdit.saveButton",
      );

      expect( useStore.getState( ).uploadQueue ).toHaveLength( 0 );
      expect( mockStartUploadsFromMultiObsEdit ).not.toHaveBeenCalled( );
    } );
  } );
} );
