// @flow

import { useEffect } from "react";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";

const isTablet = DeviceInfo.isTablet();

// Note: if using this with a tab screen, ensure you set unmountOnBlur: true
const useUnlockScreen = () => {
  useEffect(() => {
    Orientation.unlockAllOrientations();

    return () => {
      if (!isTablet) {
        Orientation.lockToPortrait();
      }
    };
  }, []);
};

export default useUnlockScreen;
