import { createSection, useRozeniteControlsPlugin } from "@rozenite/controls-plugin";
import { useMMKVDevTools } from "@rozenite/mmkv-plugin";
import { useNetworkActivityDevTools } from "@rozenite/network-activity-plugin";
import { useRequireProfilerDevTools } from "@rozenite/require-profiler-plugin";
import { useTanStackQueryDevTools } from "@rozenite/tanstack-query-plugin";
import type {
  QueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import type { MMKV } from "react-native-mmkv";

import { DevOnlyFlag, FeatureFlag } from "../types/dynamicConfig";
import { useDynamicConfigInternals } from "./useDynamicConfig";

interface RozeniteOptions {
    queryClient: QueryClient;
    mmkvStorages: Record<string, MMKV>;
}

// TODO: the react-navigation rozenite plugin is called elsewhere and should be moved here
// src/navigation/OfflineNavigationGuard.tsx. We need to lift the navRef state
// up to where useRozenite is called so it can be used as an option here.

// note: Rozenite plugins are automatically disabled / noops in Production builds
const useRozenite = ( { queryClient, mmkvStorages }: RozeniteOptions ) => {
  useTanStackQueryDevTools( queryClient );
  useNetworkActivityDevTools();
  useMMKVDevTools( {
    storages: mmkvStorages,
  } );
  useRequireProfilerDevTools();
  const { resolvedValue: exploreV2Enabled, setOverride: setExploreV2Enabled }
    = useDynamicConfigInternals( FeatureFlag.ExploreV2Enabled );

  const { resolvedValue: simulateAirplaneModeEnabled, setOverride: setSimulateAirplaneModeEnabled }
    = useDynamicConfigInternals( DevOnlyFlag.SimulateAirplaneModeEnabled );

  const sections = useMemo(
    () => [
      createSection( {
        id: "feature-flags",
        title: "Feature Flags",
        items: [
          {
            id: "explore-v2",
            type: "toggle",
            title: "ExploreV2",
            value: exploreV2Enabled,
            onUpdate: () => {
              setExploreV2Enabled( !exploreV2Enabled );
            },
          },
        ],
      } ),
      createSection( {
        id: "development-only-flags",
        title: "Development-only Flags",
        items: [
          {
            id: "simulated-airplane-mode",
            type: "toggle",
            title: "Simulated Airplane Mode",
            value: simulateAirplaneModeEnabled,
            onUpdate: () => {
              setSimulateAirplaneModeEnabled( !simulateAirplaneModeEnabled );
            },
          },
        ],
      } ),
    ],
    [
      exploreV2Enabled,
      setExploreV2Enabled,
      setSimulateAirplaneModeEnabled,
      simulateAirplaneModeEnabled],
  );

  useRozeniteControlsPlugin( { sections } );
};

export default useRozenite;
