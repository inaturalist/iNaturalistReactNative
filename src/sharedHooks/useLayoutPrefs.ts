import useStore from "stores/useStore";

// Wraps values from the layout slice with descriptive names
const selector = state => ( {
  // Vestigial stuff
  obsDetailsTab: state.obsDetailsTab,
  setObsDetailsTab: state.setObsDetailsTab,
  loggedInWhileInDefaultMode: state.loggedInWhileInDefaultMode,
  setLoggedInWhileInDefaultMode: state.setLoggedInWhileInDefaultMode,
  // newer stuff
  ...state.layout
} );

const useLayoutPrefs = ( ) => useStore( selector );

export default useLayoutPrefs;
