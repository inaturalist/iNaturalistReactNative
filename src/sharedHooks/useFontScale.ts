import {
  useEffect,
  useState
} from "react";
import DeviceInfo from "react-native-device-info";

const useFontScale = ( ): {
  isLargeFontScale: boolean;
} => {
  const [isLargeFontScale, setIsLargeFontScale] = useState<boolean>( false );

  useEffect( ( ) => {
    DeviceInfo.getFontScale().then( fontScale => {
      if ( fontScale > 1.3 ) setIsLargeFontScale( true );
      else setIsLargeFontScale( false );
    } );
  }, [] );

  return {
    isLargeFontScale
  };
};

export default useFontScale;
