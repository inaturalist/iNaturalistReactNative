import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { InteractionManager } from "react-native";

const TIMEOUT = 300;

// this hook scrolls the scrollview to this y position after animations are completed
const useScrollToOffset = scrollViewRef => {
  const [oneTimeScrollOffsetY, setOneTimeScrollOffsetY] = useState( 0 );
  const [heightOfTopContent, setHeightOfTopContent] = useState( 0 );

  const setOffsetToActivityItem = useCallback( layout => {
    const newOffset = layout.y + heightOfTopContent;

    if ( Math.abs( newOffset - oneTimeScrollOffsetY ) > 1 ) {
      setOneTimeScrollOffsetY( newOffset );
    }
  }, [heightOfTopContent, oneTimeScrollOffsetY] );

  const setHeightOfContentAboveSection = useCallback( layout => {
    const newOffset = layout.height;
    if ( Math.abs( newOffset - heightOfTopContent ) > 1 ) {
      setHeightOfTopContent( newOffset );
    }
  }, [heightOfTopContent] );

  useEffect( ( ) => {
    if ( oneTimeScrollOffsetY > 0 && scrollViewRef?.current ) {
      InteractionManager.runAfterInteractions( ( ) => {
        scrollViewRef?.current?.scrollTo( { y: oneTimeScrollOffsetY, animated: true } );

        setTimeout( ( ) => {
          setOneTimeScrollOffsetY( 0 );
          setHeightOfTopContent( 0 );
        }, TIMEOUT );
      } );
    }
  }, [oneTimeScrollOffsetY, scrollViewRef] );

  return {
    setHeightOfContentAboveSection,
    setOffsetToActivityItem,
  };
};

export default useScrollToOffset;
