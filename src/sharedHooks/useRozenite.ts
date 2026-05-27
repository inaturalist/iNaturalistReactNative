import * as RNFS from "@dr.pogodin/react-native-fs";
import { createSection, useRozeniteControlsPlugin } from "@rozenite/controls-plugin";
import {
  createRNFSAdapter,
  useFileSystemDevTools,
} from "@rozenite/file-system-plugin";
import { useNetworkActivityDevTools } from "@rozenite/network-activity-plugin";
import { useRequireProfilerDevTools } from "@rozenite/require-profiler-plugin";
import type { StorageAdapter } from "@rozenite/storage-plugin";
import { useRozeniteStoragePlugin } from "@rozenite/storage-plugin";
import { useTanStackQueryDevTools } from "@rozenite/tanstack-query-plugin";
import type {
  QueryClient,
} from "@tanstack/react-query";
import { useFeatureFlagForDebug } from "components/Developer/FeatureFlags";
import { useMemo } from "react";
import { FeatureFlag } from "stores/createFeatureFlagSlice";

interface RozeniteOptions {
    queryClient: QueryClient;
    storageAdapters: StorageAdapter[];
}

// TODO: the react-navigation rozenite plugin is called elsewhere and should be moved here
// src/navigation/OfflineNavigationGuard.tsx. We need to lift the navRef state
// up to where useRozenite is called so it can be used as an option here.

// note: Rozenite plugins are automatically disabled / noops in Production builds
const useRozenite = ( { queryClient, storageAdapters }: RozeniteOptions ) => {
  useTanStackQueryDevTools( queryClient );
  useNetworkActivityDevTools( );
  useRozeniteStoragePlugin( {
    storages: storageAdapters,
  } );
  useRequireProfilerDevTools( );
  useFileSystemDevTools( {
    adapter: createRNFSAdapter( RNFS ),
  } );
  const { resolvedValue: exploreV2Enabled, setOverride: setExploreV2Enabled }
    = useFeatureFlagForDebug( FeatureFlag.ExploreV2Enabled );
  const { resolvedValue: newsEnabled, setOverride: setNewsEnabled }
    = useFeatureFlagForDebug( FeatureFlag.NewsEnabled );

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
          {
            id: "news",
            type: "toggle",
            title: "Blog",
            value: newsEnabled,
            onUpdate: () => {
              setNewsEnabled( !newsEnabled );
            },
          },
        ],
      } ),
    ],
    [exploreV2Enabled, setExploreV2Enabled, newsEnabled, setNewsEnabled],
  );

  useRozeniteControlsPlugin( { sections } );
};

export default useRozenite;
