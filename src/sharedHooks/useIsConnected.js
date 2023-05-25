// @flow
import { addEventListener, useNetInfo } from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

const useIsConnected = ( ): boolean => {
  const netInfo = useNetInfo( );
  // assume there is network connectivity until proven otherwise
  // this should prevent the UI from flickering while isConnected
  // is fetched
  const [isConnected, setIsConnected] = useState(
    netInfo.isInternetReachable === null
      ? true
      : netInfo.isInternetReachable
  );

  useEffect( () => {
    const unsubscribe = addEventListener( state => {
      // Note on ios simulator, these notifications are delayed
      // https://github.com/react-native-netinfo/react-native-netinfo#issues-with-the-ios-simulator
      setIsConnected( state.isInternetReachable );
    } );

    return unsubscribe;
  }, [] );

  return isConnected;
};

export default useIsConnected;
