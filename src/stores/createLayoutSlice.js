const createLayoutSlice = set => ( {
  isAdvancedUser: false,
  setIsAdvancedUser: newValue => set( { isAdvancedUser: newValue } )
} );

export default createLayoutSlice;
