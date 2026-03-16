import {
  useCallback,
  useState,
} from "react";
import {
  Alert,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { useTranslation } from "sharedHooks";

// 200MB - number in bytes
// This number could potentially change depending on device.
// ~200MB was the amount of space left on my device when the
// native device camera gave a storage full alert -angie093024

const MIN_DEVICE_STORAGE = 200_000_000;

const useDeviceStorageFull = ( ) => {
  const { t } = useTranslation();
  const [deviceStorageFull, setDeviceStorageFull] = useState( false );

  const showStorageFullAlert = useCallback( () => Alert.alert(
    t( "Device-storage-full" ),
    t( "Device-storage-full-description" ),
    [{ text: t( "OK" ) }],
  ), [t] );

  DeviceInfo.getFreeDiskStorage().then( freeDiskStorage => {
    if ( freeDiskStorage <= MIN_DEVICE_STORAGE ) {
      setDeviceStorageFull( true );
    }
  } );

  return {
    deviceStorageFull,
    showStorageFullAlert,
  };
};

export default useDeviceStorageFull;
