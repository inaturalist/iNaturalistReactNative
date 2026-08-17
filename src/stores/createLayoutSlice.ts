import type { StateCreator } from "zustand";

export enum OBS_DETAILS_TAB {
  ACTIVITY = "ACTIVITY",
  DETAILS = "DETAILS"
}

export enum SCREEN_AFTER_PHOTO_EVIDENCE {
  SUGGESTIONS = "Suggestions",
  OBS_EDIT = "ObsEdit",
  MATCH = "Match"
}

export enum MAP_TYPES {
  STANDARD = "standard",
  HYBRID = "hybrid",
}

interface LayoutSlice {
  isAdvancedUser: boolean;
  obsDetailsTab: OBS_DETAILS_TAB;
  setObsDetailsTab: ( obsDetailsTab: OBS_DETAILS_TAB ) => void;
  loggedInWhileInDefaultMode: boolean | undefined;
  setLoggedInWhileInDefaultMode: ( loggedInWhileInDefaultMode: boolean ) => void;
  layout: {
    isDefaultMode: boolean;
    setIsDefaultMode: ( isDefaultMode: boolean ) => void;
    isAdvancedSuggestionsMode: null;
    screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE;
    setScreenAfterPhotoEvidence: ( screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE ) => void;
    isAllAddObsOptionsMode: boolean;
    setIsAllAddObsOptionsMode: ( isAllAddObsOptionsMode: boolean ) => void;
    shownOnce: object;
    setShownOnce: ( key: string ) => void;
    resetShownOnce: ( ) => void;
    loginBannerDismissed: boolean;
    setLoginBannerDismissed: ( ) => void;
    advancedModeBannerDismissed: boolean;
    setAdvancedModeBannerDismissed: ( ) => void;
    justFinishedSignup: boolean;
    setJustFinishedSignup: ( justFinishedSignup: boolean ) => void;
    dismissedAnnouncementIds: string[];
    dismissLoggedOutAnnouncement: ( id: string ) => void;
    clearLoggedOutAnnouncements: ( ) => void;
    debugModeEnabled: boolean;
    toggleDebugMode: ( ) => void;
    mapType: MAP_TYPES;
    setMapType: ( mapType: MAP_TYPES ) => void;
  };
}

const createLayoutSlice: StateCreator<LayoutSlice> = set => ( {
  // Vestigial un-namespaced values
  isAdvancedUser: false,
  // Values that do not need to be persisted
  obsDetailsTab: OBS_DETAILS_TAB.ACTIVITY,
  setObsDetailsTab: newValue => set( { obsDetailsTab: newValue } ),
  loggedInWhileInDefaultMode: undefined,
  setLoggedInWhileInDefaultMode: newValue => set(
    { loggedInWhileInDefaultMode: newValue },
  ),
  // Please put new stuff in this namespace so they will be saved to disk
  layout: {
    // Controls all all layouts related to default mode
    isDefaultMode: true,
    setIsDefaultMode: newValue => set( state => ( {
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
          : SCREEN_AFTER_PHOTO_EVIDENCE.SUGGESTIONS,
      },
    } ) ),
    // leaving isAdvancedSuggestionsMode here for backwards compatibility
    // for anyone who already set ObsEdit, but setting the default value
    // to null so we can remove it in the future
    isAdvancedSuggestionsMode: null,
    screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.MATCH,
    setScreenAfterPhotoEvidence: newScreen => set( state => ( {
      layout: {
        ...state.layout,
        screenAfterPhotoEvidence: newScreen,
        // let's stop using this isAdvancedSuggestionsMode value once users adjust their settings
        // so we can remove it in the future
        isAdvancedSuggestionsMode: null,
      },
    } ) ),
    isAllAddObsOptionsMode: false,
    setIsAllAddObsOptionsMode: newValue => set( state => ( {
      layout: {
        ...state.layout,
        isAllAddObsOptionsMode: newValue,
      },
    } ) ),
    // State to control pivot cards and other onboarding material being shown only once
    shownOnce: {},
    setShownOnce: key => set( state => ( {
      layout: {
        ...state.layout,
        shownOnce: {
          ...state.layout.shownOnce,
          [key]: true,
        },
      },
    } ) ),
    resetShownOnce: ( ) => set( state => ( {
      layout: {
        ...state.layout,
        shownOnce: {},
      },
    } ) ),
    // State to control login/signup banner being only shown once until dismissed by user
    loginBannerDismissed: false,
    setLoginBannerDismissed: ( ) => set( state => ( {
      layout: {
        ...state.layout,
        loginBannerDismissed: true,
      },
    } ) ),
    // State to control advanced mode banner being only shown once until dismissed by user
    advancedModeBannerDismissed: false,
    setAdvancedModeBannerDismissed: ( ) => set( state => ( {
      layout: {
        ...state.layout,
        advancedModeBannerDismissed: true,
      },
    } ) ),
    // State to control some components that are only supposed to be shown immediately after
    // a user signs up
    justFinishedSignup: false,
    setJustFinishedSignup: newValue => set( state => ( {
      layout: {
        ...state.layout,
        justFinishedSignup: newValue,
      },
    } ) ),
    // State to control dismissed announcementIds for logged-out announcements
    dismissedAnnouncementIds: [],
    dismissLoggedOutAnnouncement: announcementId => set( state => ( {
      layout: {
        ...state.layout,
        dismissedAnnouncementIds:
        state.layout.dismissedAnnouncementIds.includes( announcementId )
          ? state.layout.dismissedAnnouncementIds
          : [...state.layout.dismissedAnnouncementIds, announcementId],
      },
    } ) ),
    clearLoggedOutAnnouncements: ( ) => set( state => ( {
      layout: {
        ...state.layout,
        dismissedAnnouncementIds: [],
      },
    } ) ),
    // State to control debug mode
    debugModeEnabled: false,
    toggleDebugMode: ( ) => set( state => ( {
      layout: {
        ...state.layout,
        debugModeEnabled: !state.layout.debugModeEnabled,
      },
    } ) ),
    // Last selected map layers type for react-native-maps MapView ("standard" or "hybrid")
    mapType: MAP_TYPES.STANDARD,
    setMapType: newMapType => set( state => ( {
      layout: {
        ...state.layout,
        mapType: newMapType,
      },
    } ) ),
  },
} );

export default createLayoutSlice;
