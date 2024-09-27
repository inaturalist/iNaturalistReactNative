export const ACTIVITY_TAB = "ACTIVITY";
export const DETAILS_TAB = "DETAILS";

const createLayoutSlice = set => ( {
  isAdvancedUser: false,
  setIsAdvancedUser: newValue => set( { isAdvancedUser: newValue } ),
  obsDetailsTab: ACTIVITY_TAB,
  setObsDetailsTab: newValue => set( { obsDetailsTab: newValue } )
} );

export default createLayoutSlice;
