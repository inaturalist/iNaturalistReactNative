import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import React, {
  useEffect,
} from "react";
import { useTranslation } from "sharedHooks";
import { MAP_TYPES } from "stores/createLayoutSlice";
import { zustandStorage } from "stores/useStore";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( );

interface Props {
  currentMapType?: string;
  mapType?: string;
  setCurrentMapType: ( mapType: string|number ) => void;
  showSwitchMapTypeButton?: boolean;
  switchMapTypeButtonClassName?: string;
}

const SwitchMapTypeButton = ( {
  currentMapType,
  mapType,
  setCurrentMapType,
  showSwitchMapTypeButton,
  switchMapTypeButtonClassName,
}: Props ) => {
  const { t } = useTranslation( );
  useEffect( () => {
    const value = zustandStorage.getItem( "mapType" );
    if ( value && !mapType ) {
      // Load last saved map type (unless explicitly overridden by the parent
      // of the Map component)
      setCurrentMapType( value );
    }
  }, [mapType, setCurrentMapType] );

  const changeMapType = ( newMapType: string ) => {
    setCurrentMapType( newMapType );
    zustandStorage.setItem( "mapType", newMapType );
  };

  return showSwitchMapTypeButton && (
    <INatIconButton
      icon="map-layers"
      className={classnames(
        "absolute bottom-5 left-5 bg-white rounded-full",
        switchMapTypeButtonClassName,
      )}
      style={DROP_SHADOW}
      accessibilityLabel={
        currentMapType === MAP_TYPES.STANDARD
          ? t( "Standard--map-type" )
          : t( "Satellite--map-type" )
      }
      accessibilityHint={t( "Toggle-map-type" )}
      onPress={( ) => {
        changeMapType( currentMapType === MAP_TYPES.STANDARD
          ? MAP_TYPES.HYBRID
          : MAP_TYPES.STANDARD );
      }}
    />
  );
};

export default SwitchMapTypeButton;
