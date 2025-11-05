import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import React, {
  useEffect
} from "react";
import { useTranslation } from "sharedHooks";
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
  switchMapTypeButtonClassName
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
        switchMapTypeButtonClassName
      )}
      style={DROP_SHADOW}
      accessibilityLabel={t( "Toggle-map-type" )}
      onPress={( ) => {
        changeMapType( currentMapType === "standard"
          ? "hybrid"
          : "standard" );
      }}
    />
  );
};

export default SwitchMapTypeButton;
