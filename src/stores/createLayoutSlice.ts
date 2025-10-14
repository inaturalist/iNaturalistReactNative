import { LayoutSlice, StoreSlice } from "./types";

export enum OBS_DETAILS_TAB {
  ACTIVITY = "ACTIVITY",
  DETAILS = "DETAILS"
}

export enum SCREEN_AFTER_PHOTO_EVIDENCE {
  SUGGESTIONS = "Suggestions",
  OBS_EDIT = "ObsEdit",
  MATCH = "Match"
}

const createLayoutSlice: StoreSlice<LayoutSlice> = set => ( {
  // Vestigial un-namespaced values
  isAdvancedUser: false,
  // Values that do not need to be persisted
  obsDetailsTab: OBS_DETAILS_TAB.ACTIVITY,
  setObsDetailsTab: ( newValue: OBS_DETAILS_TAB ) => set( { obsDetailsTab: newValue } ),
  // undefined | true | false
  loggedInWhileInDefaultMode: undefined,
  setLoggedInWhileInDefaultMode: ( newValue: boolean ) => set(
    { loggedInWhileInDefaultMode: newValue }
  ),
  // Please put new stuff in this namespace so they will be saved to disk
  layout: {
    // Controls all all layouts related to default mode
    isDefaultMode: true,
    setIsDefaultMode: ( newValue: boolean ) => set( state => ( {
      layout: {
        ...state.layout,
        isDefaultMode: newValue,
        // reset to AICamera mode if default mode is toggled on
        // and otherwise, advanced mode default is all options
        isAllAddObsOptionsMode: newValue !== true,
        // reset to Match screen if default mode is toggled on
        // and otherwise, advanced mode default is Suggestions
        screenAfterPhotoEvidence: newValue === true
          ? SCREEN_AFTER_PHOTO_EVIDENCE.MATCH
          : SCREEN_AFTER_PHOTO_EVIDENCE.SUGGESTIONS
      }
    } ) ),
    // leaving isAdvancedSuggestionsMode here for backwards compatibility
    // for anyone who already set ObsEdit, but setting the default value
    // to null so we can remove it in the future
    isAdvancedSuggestionsMode: null,
    screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.MATCH,
    setScreenAfterPhotoEvidence: ( newScreen: SCREEN_AFTER_PHOTO_EVIDENCE ) => set( state => ( {
      layout: {
        ...state.layout,
        screenAfterPhotoEvidence: newScreen,
        // let's stop using this isAdvancedSuggestionsMode value once users adjust their settings
        // so we can remove it in the future
        isAdvancedSuggestionsMode: null
      }
    } ) ),
    isAllAddObsOptionsMode: false,
    setIsAllAddObsOptionsMode: ( newValue: boolean ) => set( state => ( {
      layout: {
        ...state.layout,
        isAllAddObsOptionsMode: newValue
      }
    } ) ),
    // State to control pivot cards and other onboarding material being shown only once
    shownOnce: {},
    setShownOnce: ( key: string ) => set( state => ( {
      layout: {
        ...state.layout,
        shownOnce: {
          ...state.layout.shownOnce,
          [key]: true
        }
      }
    } ) ),
    resetShownOnce: () => set( state => ( {
      layout: {
        ...state.layout,
        shownOnce: {}
      }
    } ) ),
    // State to control login/signup banner being only shown once until dismissed by user
    loginBannerDismissed: false,
    setLoginBannerDismissed: () => set( state => ( {
      layout: {
        ...state.layout,
        loginBannerDismissed: true
      }
    } ) ),
    // State to control some components that are only supposed to be shown immediately after
    // a user signs up
    justFinishedSignup: false,
    setJustFinishedSignup: ( newValue: boolean ) => set( state => ( {
      layout: {
        ...state.layout,
        justFinishedSignup: newValue
      }
    } ) )
  }
} );

export default createLayoutSlice;
