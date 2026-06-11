import {
  act, fireEvent, screen, waitFor, within,
} from "@testing-library/react-native";
import { InteractionManager } from "react-native";
import useStore from "stores/useStore";

export const ADD_OBS_OPTIONS = {
  aiCamera: "aicamera-button",
  standardCamera: "camera-button",
  photoImporter: "import-media-button",
  soundRecorder: "record-sound-button",
  noEvidence: "observe-without-evidence-button",
};

export function mockInteractionManagerRunAfterInteractions() {
  jest.spyOn( InteractionManager, "runAfterInteractions" ).mockImplementation( callback => {
    callback();
    return { cancel: jest.fn() };
  } );
}

/** PhotoLibrary waits for transitions and an iOS delay before opening the picker. */
export async function advancePhotoLibraryTimers() {
  if ( jest.isMockFunction( setTimeout ) ) {
    await act( async ( ) => {
      jest.advanceTimersByTime( 1_000 );
    } );
  }
  await act( async ( ) => {
    await Promise.resolve( );
  } );
}

/** Opens the add-observation bottom sheet from the tab bar. */
export async function pressAddObservationsButton() {
  const tabBar = await screen.findByTestId( "CustomTabBar" );
  const addObsButton = await within( tabBar ).findByLabelText( "Add observations" );
  fireEvent.press( addObsButton );
}

/** Presses an option in the open add-observation bottom sheet. */
export async function pressAddObsOption( testID ) {
  const button = await screen.findByTestId( testID );
  fireEvent.press( button );
  if ( testID === ADD_OBS_OPTIONS.noEvidence ) {
    await waitFor( ( ) => {
      expect( useStore.getState( ).currentObservation ).toBeTruthy( );
    } );
  }
}

/** Waits for the standard camera screen after a stack reset from the add-obs flow. */
export async function waitForStandardCameraScreen() {
  await waitFor( ( ) => {
    if ( typeof global.timeTravel === "function" ) {
      global.timeTravel( 300 );
    }
    expect( screen.getByTestId( "CameraNavButtons" ) ).toBeVisible( );
  }, { timeout: 10_000 } );
}

export async function navigateToStandardCameraFromMyObs() {
  await waitFor( ( ) => {
    expect( screen.getByTestId( "CustomTabBar" ) ).toBeVisible( );
  } );
  await pressAddObservationsButton( );
  await pressAddObsOption( ADD_OBS_OPTIONS.standardCamera );
  await waitForStandardCameraScreen( );
}
export async function navigateToPhotoImporterFromMyObs() {
  await waitFor( ( ) => {
    expect( screen.getByTestId( "CustomTabBar" ) ).toBeVisible( );
  } );
  await pressAddObservationsButton( );
  await pressAddObsOption( ADD_OBS_OPTIONS.photoImporter );
  await advancePhotoLibraryTimers( );
}

export async function waitForSoundRecorderScreen() {
  await waitFor( ( ) => {
    if ( typeof global.timeTravel === "function" ) {
      global.timeTravel( 300 );
    }
    expect( screen.getByTestId( "MediaNavButtons" ) ).toBeVisible( );
  }, { timeout: 10_000 } );
}

export async function navigateToSoundRecorderFromMyObs() {
  await waitFor( ( ) => {
    expect( screen.getByTestId( "CustomTabBar" ) ).toBeVisible( );
  } );
  await pressAddObservationsButton( );
  await pressAddObsOption( ADD_OBS_OPTIONS.soundRecorder );
  await waitForSoundRecorderScreen( );
}
