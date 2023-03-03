// @flow
import classNames from "classnames";
import { View } from "components/styledComponents";
import * as React from "react";
import { useEffect, useState } from "react";
import { Keyboard } from "react-native";
import { useTheme } from "react-native-paper";
import { getShadowStyle } from "styles/global";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 4,
  opacity: 0.4,
  radius: 4
} );

type Props = {
  position: "topStart" | "topEnd" | "bottomStart" | "bottomEnd",
  containerClass?: string,
  children: React.Node
}

// Ensure this component is placed outside of scroll views

const FloatingActionBar = ( {
  position = "bottomEnd",
  containerClass,
  children
}: Props ): React.Node => {
  const theme = useTheme( );
  const [keyboardHeight, setKeyboardHeight] = useState( 0 );
  const [keyboardOpen, setKeyboardOpen] = useState( false );

  useEffect( ( ) => {
    const showSubscription = Keyboard.addListener( "keyboardDidShow", event => {
      setKeyboardHeight( event.endCoordinates.height );
      setKeyboardOpen( true );
    } );
    const hideSubscription = Keyboard.addListener( "keyboardDidHide", ( ) => {
      setKeyboardOpen( false );
    } );

    return ( ) => {
      showSubscription.remove( );
      hideSubscription.remove( );
    };
  }, [] );

  const isBottom = position === "bottomEnd" || position === "bottomStart";

  return (
    <View
      className={classNames(
        "absolute z-50 bg-white rounded-lg",
        containerClass,
        {
          "top-0 left-0": position === "topStart",
          "top-0 right-0": position === "topEnd",
          "left-0": position === "bottomStart",
          "right-0": position === "bottomEnd"
        }
      )}
      style={{
        ...getShadow( theme.colors.primary ),
        ...( isBottom ? {
          bottom: keyboardOpen ? keyboardHeight : 0
        } : {} )
      }}
    >
      {children}
    </View>
  );
};

export default FloatingActionBar;
