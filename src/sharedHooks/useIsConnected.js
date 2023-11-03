// @flow
import { useNetInfo } from "@react-native-community/netinfo";

const useIsConnected = ( ): boolean => {
  const { isInternetReachable } = useNetInfo( );
  return isInternetReachable;
};

export default useIsConnected;
