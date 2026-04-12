import type { RefObject } from "react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import type { LayoutRectangle, ScrollView } from "react-native";
import { InteractionManager } from "react-native";

const TIMEOUT = 300;

// this hook scrolls the scrollview to this y position after animations are completed
const useScrollToOffset = ( scrollViewRef: RefObject<ScrollView | null> ) => {
  const [oneTimeScrollOffsetY, setOneTimeScrollOffsetY] = useState( 0 );
  const [heightOfTopContent, setHeightOfTopContent] = useState( 0 );

  const setOffsetToActivityItem = useCallback( ( layout: LayoutRectangle ) => {
    const newOffset = layout.y + heightOfTopContent;

    if ( Math.abs( newOffset - oneTimeScrollOffsetY ) > 1 ) {
      setOneTimeScrollOffsetY( newOffset );
    }
  }, [heightOfTopContent, oneTimeScrollOffsetY] );

  const setHeightOfContentAboveSection = useCallback( ( layout: LayoutRectangle ) => {
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
