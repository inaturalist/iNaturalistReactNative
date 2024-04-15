export const ACTIVITY_TAB_ID = "ACTIVITY";
export const DETAILS_TAB_ID = "DETAILS";

const createLayoutSlice = set => ( {
  isAdvancedUser: false,
  setIsAdvancedUser: newValue => set( { isAdvancedUser: newValue } ),
  currentTabId: ACTIVITY_TAB_ID,
  setCurrentTabId: newValue => set( { currentTabId: newValue } )
} );

export default createLayoutSlice;
