import useStore from "stores/useStore";

// Wraps values from the layout slice with descriptive names
const useLayoutPrefs = ( ) => useStore( state => ( {
  // Vestigial stuff
  obsDetailsTab: state.obsDetailsTab,
  setObsDetailsTab: state.setObsDetailsTab,
  isAllAddObsOptionsMode: state.isAdvancedUser,
  setIsAllAddObsOptionsMode: state.setIsAdvancedUser,

  // newer stuff
  ...state.layout
} ) );

export default useLayoutPrefs;
