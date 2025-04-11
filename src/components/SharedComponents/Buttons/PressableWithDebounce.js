import {
  Pressable
} from "components/styledComponents";
import React, { useEffect, useRef, useState } from "react";
import { GestureResponderEvent, ViewStyle } from "react-native";

interface Props {
    accessibilityHint?: string;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    style?: ViewStyle;
    className?: string;
    onPress: () => void;
    testID?: string;
    children?: unknown;
    disabled: boolean;
    debounceTime?: number;
    preventMultipleTaps?: boolean;
}

const PressableWithDebounce = ( {
  accessibilityHint,
  accessibilityLabel,
  accessibilityRole,
  style,
  className,
  testID,
  onPress,
  disabled,
  children,
  debounceTime = 400,
  preventMultipleTaps = true
}: Props ) => {
  const [isProcessing, setIsProcessing] = useState( false );
  const onPressRef = useRef( onPress );

  useEffect( ( ) => {
    onPressRef.current = onPress;
  }, [onPress] );

  const handleOnPress = ( event?: GestureResponderEvent ) => {
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
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled }}
      style={style}
      className={className}
      testID={testID}
      onPress={handleOnPress}
      disabled={isDisabled}
    >
      {children}
    </Pressable>
  );
};

export default PressableWithDebounce;
