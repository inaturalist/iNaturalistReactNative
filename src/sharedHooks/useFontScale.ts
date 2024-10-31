import {
  useState
} from "react";
import DeviceInfo from "react-native-device-info";

const useFontScale = ( ):Object => {
  const [isLargeFontScale, setIsLargeFontScale] = useState<boolean>( false );

  DeviceInfo.getFontScale().then( fontScale => {
    if ( fontScale > 1.3 ) setIsLargeFontScale( true );
    else setIsLargeFontScale( false );
  } );

  return {
    isLargeFontScale
  };
};

export default useFontScale;
