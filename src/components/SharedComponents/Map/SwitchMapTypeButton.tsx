import AsyncStorage from "@react-native-async-storage/async-storage";
import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import type { Node } from "react";
import React, {
  useEffect
} from "react";
import { useTranslation } from "sharedHooks";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadowForColor( colors.darkGray );

interface Props {
  currentMapType?: string,
  mapType?: string,
  setCurrentMapType: Function,
  showSwitchMapTypeButton?: boolean,
  switchMapTypeButtonClassName: string
}

const SwitchMapTypeButton = ( {
  currentMapType,
  mapType,
  setCurrentMapType,
  showSwitchMapTypeButton,
  switchMapTypeButtonClassName
}: Props ): Node => {
  const { t } = useTranslation( );
  useEffect( () => {
    AsyncStorage.getItem( "mapType" ).then( value => {
      if ( value && !mapType ) {
        // Load last saved map type (unless explicitly overridden by the parent
        // of the Map component)
        setCurrentMapType( value );
      }
    } );
  }, [mapType, setCurrentMapType] );

  const changeMapType = async newMapType => {
    setCurrentMapType( newMapType );
    await AsyncStorage.setItem( "mapType", newMapType );
  };

  return showSwitchMapTypeButton && (
    <INatIconButton
      icon="map-layers"
      className={classnames(
        "absolute bottom-5 left-5 bg-white rounded-full",
        switchMapTypeButtonClassName
      )}
      style={DROP_SHADOW}
      accessibilityLabel={t( "Toggle-map-type" )}
      accessibilityRole="button"
      accessibilityState={
        currentMapType === "standard"
          ? t( "Standard--map-type" )
          : t( "Satellite--map-type" )
      }
      onPress={( ) => {
        changeMapType( currentMapType === "standard"
          ? "hybrid"
          : "standard" );
      }}
    />
  );
};

export default SwitchMapTypeButton;
