import {
  useState
} from "react";
import DeviceInfo from "react-native-device-info";

const useFontScale = ( ) => {
  const [isLargeFontScale, setIsLargeFontScale] = useState( false );

  DeviceInfo.getFontScale().then( fontScale => {
    if ( fontScale > 1.3 ) setIsLargeFontScale( true );
    else setIsLargeFontScale( false );
  } );

  return {
    isLargeFontScale
  };
};

export default useFontScale;
