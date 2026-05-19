import { stat } from "@dr.pogodin/react-native-fs";
import zustandMMKVBackingStorage from "stores/zustandMMKVBackingStorage";

export interface StorageMetrics {
  realmDbBytes: number | "NA";
  mmkvBytes: number;
}

const getStorageMetrics = async ( realmPath?: string | null ): Promise<StorageMetrics> => {
  const realmBytes = realmPath
    ? ( await stat( realmPath ).catch( () => ( { size: 0 } ) ) ).size
    : "NA";
  return {
    realmDbBytes: realmBytes,
    mmkvBytes: zustandMMKVBackingStorage.size,
  };
};

export default getStorageMetrics;
