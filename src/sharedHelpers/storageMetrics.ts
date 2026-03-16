import RNFS from "react-native-fs";
import { logFilePath } from "sharedHelpers/logger";
import zustandMMKVBackingStorage from "stores/zustandMMKVBackingStorage";

export interface StorageMetrics {
  realmDbBytes: number | "NA";
  mmkvBytes: number;
  logFileBytes: number | "NA";
}

const getStorageMetrics = async ( realmPath?: string | null ): Promise<StorageMetrics> => {
  const realmBytes = realmPath
    ? ( await RNFS.stat( realmPath ).catch( () => ( { size: 0 } ) ) ).size
    : "NA";
  const logFileBytes = logFilePath
    ? ( await RNFS.stat( logFilePath ).catch( () => ( { size: 0 } ) ) ).size
    : "NA";
  return {
    realmDbBytes: realmBytes,
    mmkvBytes: zustandMMKVBackingStorage.size,
    logFileBytes,
  };
};

export default getStorageMetrics;
