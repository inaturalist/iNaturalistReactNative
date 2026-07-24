import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import React from "react";
import { useTranslation } from "sharedHooks";
import { MAP_TYPES } from "stores/createLayoutSlice";
import useStore from "stores/useStore";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( );

interface Props {
  mapType?: MAP_TYPES;
  showSwitchMapTypeButton?: boolean;
  switchMapTypeButtonClassName?: string;
}

const SwitchMapTypeButton = ( {
  mapType,
  showSwitchMapTypeButton,
  switchMapTypeButtonClassName,
}: Props ) => {
  const { t } = useTranslation( );
  const setMapType = useStore( state => state.layout.setMapType );

  const changeMapType = ( newMapType: MAP_TYPES ) => {
    setMapType( newMapType );
  };

  return showSwitchMapTypeButton && (
    <INatIconButton
      icon="map-layers"
      className={classnames(
        "absolute bg-white rounded-full",
        switchMapTypeButtonClassName || "bottom-5 left-5",
      )}
      style={DROP_SHADOW}
      accessibilityLabel={
        mapType === MAP_TYPES.STANDARD
          ? t( "Standard--map-type" )
          : t( "Satellite--map-type" )
      }
      accessibilityHint={t( "Toggle-map-type" )}
      onPress={( ) => {
        changeMapType( mapType === MAP_TYPES.STANDARD
          ? MAP_TYPES.HYBRID
          : MAP_TYPES.STANDARD );
      }}
    />
  );
};

export default SwitchMapTypeButton;
