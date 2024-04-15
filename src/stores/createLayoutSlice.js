const createLayoutSlice = set => ( {
  isAdvancedUser: false,
  setIsAdvancedUser: newValue => set( { isAdvancedUser: newValue } ),
  currentTabId: "ACTIVITY",
  setCurrentTabId: newValue => set( { currentTabId: newValue } )
} );

export default createLayoutSlice;
