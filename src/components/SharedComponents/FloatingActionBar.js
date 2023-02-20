// @flow
import classNames from "classnames";
import { View } from "components/styledComponents";
import * as React from "react";
import { useEffect, useState } from "react";
import { Keyboard, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

type Props = {
  position: "topStart" | "topEnd" | "bottomStart" | "bottomEnd",
  marginX: string,
  marginY: string,
  children: React.Node
}

const getShadow = shadowColor => StyleSheet.create( {
  shadowColor,
  shadowOffset: {
    width: 0,
    height: 4
  },
  // $FlowIssue[incompatible-shape]
  shadowOpacity: 0.4,
  // $FlowIssue[incompatible-shape]
  shadowRadius: 4,
  // $FlowIssue[incompatible-shape]
  elevation: 5
} );

// Ensure this component is placed outside of scroll views

const FloatingActionBar = ( {
  position = "bottomEnd",
  marginX,
  marginY,
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
        marginX,
        marginY,
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
