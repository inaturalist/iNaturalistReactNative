import useStore, { zustandStorage } from "stores/useStore";

const DEBUG_MODE = "debugMode";

const useDebugMode = ( ): { isDebug: boolean; toggleDebug: () => void } => {
  const isDebug = useStore( state => state.layout.debugModeEnabled );
  const toggleDebug = useStore( state => state.layout.toggleDebugMode );
  return {
    isDebug,
    toggleDebug,
  };
};

export function isDebugMode( ): boolean {
  return zustandStorage.getItem( DEBUG_MODE ) === "true";
}

export default useDebugMode;
