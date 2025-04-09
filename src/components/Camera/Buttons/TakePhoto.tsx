import classnames from "classnames";
import {
  INatIcon
} from "components/SharedComponents";
import {
  Pressable, View
} from "components/styledComponents";
import React, { useEffect, useRef, useState } from "react";
import { GestureResponderEvent } from "react-native";
import { useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadow( { offsetHeight: 4 } );

interface Props {
  takePhoto: () => Promise<void>;
  disabled: boolean;
  showPrediction?: boolean;
}

const TakePhoto = ( {
  takePhoto,
  disabled,
  showPrediction,
  debounceTime = 400,
  preventMultipleTaps = true
}: Props ) => {
  const { t } = useTranslation( );

  const borderClass = "border-[2px] rounded-full h-[64px] w-[64px]";

  const [isProcessing, setIsProcessing] = useState( false );
  const onPressRef = useRef( takePhoto );

  useEffect( ( ) => {
    onPressRef.current = takePhoto;
  }, [takePhoto] );
  const handleTakePhoto = ( event?: GestureResponderEvent ) => {
    if ( !preventMultipleTaps ) {
      onPressRef.current( event );
      return;
    }

    if ( isProcessing ) return;

    setIsProcessing( true );

    onPressRef.current( event );

    setTimeout( ( ) => {
      setIsProcessing( false );
    }, debounceTime );
  };

  const isDisabled = disabled || ( preventMultipleTaps && isProcessing );

  return (
    <Pressable
      className={classnames(
        "bg-white",
        "rounded-full",
        "h-[74px]",
        "w-[74px]",
        "justify-center",
        "items-center",
        {
          "opacity-50": disabled
        }
      )}
      onPress={handleTakePhoto}
      accessibilityLabel={t( "Take-photo" )}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={isDisabled}
      style={DROP_SHADOW}
      testID="take-photo-button"
    >
      {showPrediction
        ? (
          <View
            className={classnames(
              borderClass,
              "bg-inatGreen items-center justify-center border-accessibleGreen"
            )}
          >
            <INatIcon
              name="sparkly-label"
              size={32}
              color={colors.white}
            />
          </View>
        )
        : <View className={borderClass} />}
    </Pressable>
  );
};

export default TakePhoto;
