import { useNetInfo } from "@react-native-community/netinfo";
import { useMemo } from "react";
import { DevOnlyFlag } from "types/dynamicConfig";

import { useDynamicConfigInternals } from "./useDynamicConfig";

const useConnectionStatus = () => {
  const { overrideValue: simulateAirplaneModeEnabled }
    = useDynamicConfigInternals( DevOnlyFlag.SimulateAirplaneModeEnabled );

  const { isConnected } = useNetInfo();

  const connectionStatus = useMemo( () => ( {
    isConnected: simulateAirplaneModeEnabled === null
      ? isConnected
      : !simulateAirplaneModeEnabled,
  } ), [isConnected, simulateAirplaneModeEnabled] );

  return connectionStatus;
};

export default useConnectionStatus;
