import { useFocusEffect } from "@react-navigation/native";
import type { PropsWithChildren } from "react";
import React, { useCallback, useState } from "react";

/**
 * React Navigation never unmounts a component, leading to weirdly immortal
 * components that preserve their state forever, and to memory leaks when
 * effects open connections or load things and never disconnect them or
 * dispose of them. This component renders its children when it has focus in
 * React Navigation and does not when it loses focus, thereby unmounting
 * those children causing effects to clean up after themselves. Valar
 * Morghulis!
 * @see https://www.corstianboerman.com/blog/2020-09-05/force-a-component-to-unmount-with-react-navigation
 */
const Mortal = ( { children }: PropsWithChildren ) => {
  const [isVisible, setIsVisible] = useState( false );
  useFocusEffect(
    useCallback( ( ) => {
      setIsVisible( true );

      return ( ) => {
        setIsVisible( false );
      };
    }, [] ),
  );

  if ( !isVisible ) return null;

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{ children }</>;
};

export default Mortal;
