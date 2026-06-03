import useStore from "stores/useStore";

// Imperative read of debug mode
const isDebugMode = ( ): boolean => useStore.getState( ).layout.debugModeEnabled === true;

export default isDebugMode;
