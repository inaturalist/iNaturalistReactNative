import { stat } from "@dr.pogodin/react-native-fs";
import { legacyLogfilePath } from "sharedHelpers/logger";
import zustandMMKVBackingStorage from "stores/zustandMMKVBackingStorage";

export interface StorageMetrics {
  realmDbBytes: number | "NA";
  mmkvBytes: number;
  logFileBytes: number | "NA";
}

const getStorageMetrics = async ( realmPath?: string | null ): Promise<StorageMetrics> => {
  const realmBytes = realmPath
    ? ( await stat( realmPath ).catch( () => ( { size: 0 } ) ) ).size
    : "NA";
  const logFileBytes = legacyLogfilePath
    ? ( await stat( legacyLogfilePath ).catch( () => ( { size: 0 } ) ) ).size
    : "NA";
  return {
    realmDbBytes: realmBytes,
    mmkvBytes: zustandMMKVBackingStorage.size,
    logFileBytes,
  };
};

export default getStorageMetrics;
