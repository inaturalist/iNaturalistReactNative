import { useEffect, useState } from "react";
import {
  Dimensions,
  Keyboard
} from "react-native";

const useKeyboardInfo = ( ) => {
  const [keyboardShown, setKeyboardShown] = useState( false );
  const [keyboardHeight, setKeyboardHeight] = useState( 0 );
  const nonKeyboardHeight = Dimensions.get( "screen" ).height - keyboardHeight;

  useEffect( ( ) => {
    const showSubscription = Keyboard.addListener( "keyboardDidShow", keyboardDidShowEvent => {
      setKeyboardHeight( keyboardDidShowEvent.endCoordinates.height );
      setKeyboardShown( true );
    } );
    const hideSubscription = Keyboard.addListener( "keyboardDidHide", keyboardDidHideEvent => {
      setKeyboardHeight( keyboardDidHideEvent.endCoordinates.height );
      setKeyboardShown( false );
    } );

    return () => {
      showSubscription.remove( );
      hideSubscription.remove( );
    };
  }, [] );

  return {
    keyboardShown,
    keyboardHeight,
    nonKeyboardHeight
  };
};

export default useKeyboardInfo;
