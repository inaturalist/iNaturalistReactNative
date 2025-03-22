export enum OBS_DETAILS_TAB {
  ACTIVITY = "ACTIVITY",
  DETAILS = "DETAILS"
}

const createLayoutSlice = set => ( {
  // Vestigial un-namespaced values
  isAdvancedUser: false,
  setIsAdvancedUser: ( newValue: boolean ) => set( { isAdvancedUser: newValue } ),
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
        isDefaultMode: newValue
      }
    } ) ),
    isAdvancedSuggestionsMode: true,
    setIsSuggestionsFlowMode: ( newValue: boolean ) => set( state => ( {
      layout: {
        ...state.layout,
        isAdvancedSuggestionsMode: newValue
      }
    } ) ),
    displayAdvancedSettings: false,
    setDisplayAdvancedSettings: ( newValue: boolean ) => set( state => ( {
      layout: {
        ...state.layout,
        displayAdvancedSettings: newValue
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
    } ) )
  }
} );

export default createLayoutSlice;
