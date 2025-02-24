export enum OBS_DETAILS_TAB {
  ACTIVITY = "ACTIVITY",
  DETAILS = "DETAILS"
}

const createLayoutSlice = set => ( {
  // Vestigial un-namespaced values
  isAdvancedUser: false,
  setIsAdvancedUser: ( newValue: boolean ) => set( { isAdvancedUser: newValue } ),

  obsDetailsTab: OBS_DETAILS_TAB.ACTIVITY,
  setObsDetailsTab: ( newValue: OBS_DETAILS_TAB ) => set( { obsDetailsTab: newValue } ),

  // Please put new stuff in this namespace so they will be saved to disk
  layout: {
    // Controls all all layouts related to default mode
    isDefaultMode: false,
    setIsDefaultMode: ( newValue: boolean ) => set( state => ( {
      layout: {
        ...state.layout,
        isDefaultMode: newValue
      }
    } ) ),
    isSuggestionsFlowMode: false,
    setIsSuggestionsFlowMode: ( newValue: boolean ) => set( state => ( {
      layout: {
        ...state.layout,
        isSuggestionsFlowMode: newValue
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
