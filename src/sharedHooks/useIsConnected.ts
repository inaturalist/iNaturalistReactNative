import { useNetInfo } from "@react-native-community/netinfo";

// Note that a return value of null means the state is unknown
const useIsConnected = ( ): boolean | null => {
  const { isInternetReachable } = useNetInfo( );
  return isInternetReachable;
};

export default useIsConnected;
