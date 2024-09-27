import { t } from "i18next";
import {
  useCallback,
  useState
} from "react";
import {
  Alert
} from "react-native";
import DeviceInfo from "react-native-device-info";

// 200MB - number in bytes
const MIN_DEVICE_STORAGE = 200_000_000;

const useDeviceStorageFull = ( ) => {
  const [deviceStorageFull, setDeviceStorageFull] = useState( false );
  console.log( "use" );

  const showStorageFullAlert = useCallback( () => Alert.alert(
    t( "Device-storage-full" ),
    t( "Device-storage-full-description" ),
    [{ text: t( "OK" ) }]
  ), [] );

  DeviceInfo.getFreeDiskStorage().then( freeDiskStorage => {
    if ( freeDiskStorage <= MIN_DEVICE_STORAGE ) {
      setDeviceStorageFull( true );
    }
  } );

  return {
    deviceStorageFull,
    showStorageFullAlert
  };
};

export default useDeviceStorageFull;
