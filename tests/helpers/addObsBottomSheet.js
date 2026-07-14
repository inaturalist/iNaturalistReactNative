import {
  act,
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import { InteractionManager } from "react-native";
import useStore from "stores/useStore";

const actor = userEvent.setup( );

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
  await actor.press( addObsButton );
}

/** Presses an option in the open add-observation bottom sheet. */
export async function pressAddObsOption( testID ) {
  const button = await screen.findByTestId( testID );
  await actor.press( button );
  if ( testID === ADD_OBS_OPTIONS.noEvidence ) {
    await waitFor( ( ) => {
      expect( useStore.getState( ).currentObservation ).toBeTruthy( );
    } );
  }
}

/** Waits for the standard camera screen after a stack reset from the add-obs flow. */
export async function waitForStandardCameraScreen() {
  await waitFor( ( ) => {
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

export async function waitForMyObservationsScreen() {
  await waitFor( ( ) => {
    const tabBar = screen.getByTestId( "CustomTabBar" );
    expect( within( tabBar ).getByLabelText( "Add observations" ) ).toBeVisible( );
  }, { timeout: 10_000 } );
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

export async function navigateToAICameraFromMyObs() {
  await waitFor( ( ) => {
    expect( screen.getByTestId( "CustomTabBar" ) ).toBeVisible( );
  } );
  await pressAddObservationsButton( );
  await pressAddObsOption( ADD_OBS_OPTIONS.aiCamera );
  await waitFor( ( ) => {
    expect( screen.getByTestId( "take-photo-button" ) ).toBeVisible( );
  }, { timeout: 10_000 } );
}

export async function takeAICameraPhotoAndOpenSuggestions() {
  await actor.press( await screen.findByTestId( "take-photo-button" ) );
  await waitFor( ( ) => {
    expect( screen.getByText( /ADD AN ID/ ) ).toBeVisible( );
  }, { timeout: 10_000 } );
}

/** Opens AI camera from My Obs and lands on Suggestions. */
export async function navigateToSuggestionsViaAICameraFromMyObs() {
  await navigateToAICameraFromMyObs( );
  await takeAICameraPhotoAndOpenSuggestions( );
}

export async function takeStandardCameraPhotoAndConfirm() {
  await actor.press( await screen.findByTestId( "take-photo-button" ) );
  await actor.press( await screen.findByLabelText( "View suggestions" ) );
}

async function pressObsEditSaveButton() {
  await actor.press( await screen.findByTestId( "ObsEdit.saveButton" ) );
}

/** Dismisses TextSheet confirmations (missing evidence, imprecise location). */
async function confirmObsEditWarningSheets() {
  for ( let attempt = 0; attempt < 2; attempt += 1 ) {
    let okButton;
    try {
      // eslint-disable-next-line no-await-in-loop
      okButton = await screen.findByText( "OK", {}, { timeout: 2_000 } );
    } catch {
      break;
    }
    // eslint-disable-next-line no-await-in-loop
    await actor.press( okButton );
    // eslint-disable-next-line no-await-in-loop
    await pressObsEditSaveButton();
  }
}

/** Saves on ObsEdit, confirming warning sheets when they appear, then waits for My Obs. */
export async function saveObsEditObservation( _options = {} ) {
  await pressObsEditSaveButton();
  await confirmObsEditWarningSheets();
}

/** Waits until at least one observation appears on the My Obs grid. */
export async function waitForMyObsGridItems() {
  return waitFor( ( ) => {
    const items = screen.queryAllByTestId( /MyObservations\.obsGridItem\..*/ );
    if ( items.length === 0 ) {
      throw new Error( "Waiting for My Obs grid items" );
    }
    return items;
  }, { timeout: 15_000 } );
}
