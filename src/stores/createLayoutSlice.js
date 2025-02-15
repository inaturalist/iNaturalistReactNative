export const ACTIVITY_TAB = "ACTIVITY";
export const DETAILS_TAB = "DETAILS";

const createLayoutSlice = set => ( {
  // Vestigial un-namespaced values
  isAdvancedUser: false,
  setIsAdvancedUser: newValue => set( { isAdvancedUser: newValue } ),

  obsDetailsTab: ACTIVITY_TAB,
  setObsDetailsTab: newValue => set( { obsDetailsTab: newValue } ),

  // Please put new stuff in this namespace so they will be saved to disk
  layout: {
    // Controls all layouts related to default mode
    isDefaultMode: false,
    setIsDefaultMode: newValue => set( state => ( {
      layout: {
        ...state.layout,
        isDefaultMode: newValue
      }
    } ) )
  }
} );

export default createLayoutSlice;
