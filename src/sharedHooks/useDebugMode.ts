import useStore, { zustandStorage } from "stores/useStore";

const DEBUG_MODE = "debugMode";

const useDebugMode = ( ): { isDebug: boolean } => {
  const isDebug = useStore( state => state.layout.debugModeEnabled );
  return {
    isDebug,
  };
};

export function isDebugMode( ): boolean {
  return zustandStorage.getItem( DEBUG_MODE ) === "true";
}

export default useDebugMode;
