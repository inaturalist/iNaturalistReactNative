import useStore from "stores/useStore";

const useDebugMode = ( ): { isDebug: boolean } => {
  const isDebug = useStore( state => state.layout.debugModeEnabled );
  return {
    isDebug,
  };
};

export default useDebugMode;
