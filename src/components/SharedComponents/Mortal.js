// @flow

import React, { useState, useCallback } from "react";
import type { Node } from "react";
import { useFocusEffect } from "@react-navigation/native";

type Props = {
  children: Node
}

/**
 * React Navigation never unmounts a component, leading to weirdly immortal
 * componentsthat preserve their state forever, and to memory leaks when
 * effects open connections or load things and never disconnect them or
 * dispose of them. This component renders its children when it has focus in
 * React Navigation and does not when it loses focus, thereby unmounting
 * those children causing effects to clean up after themselves. Valar
 * Morghulis!
 * @see https://www.corstianboerman.com/blog/2020-09-05/force-a-component-to-unmount-with-react-navigation
 */
export default function Mortal( { children }: Props ): Node {
  const [isVisible, setIsVisible] = useState( false );

  useFocusEffect(
    useCallback( ( ) => {
      setIsVisible( true );

      return ( ) => {
        setIsVisible( false );
      };
    }, [] )
  );

  return (
    <>{ isVisible && children }</>
  );
}
