// @flow

import ObsStatus from "components/MyObservations/ObsStatus";
import { INatIcon } from "components/SharedComponents";
import type { Node } from "react";
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useTheme } from "react-native-paper";
import Observation from "realmModels/Observation";

type Props = {
  wasSynced: boolean,
  observation: typeof Observation,
  layout?: "horizontal" | "vertical",
  white?: boolean,
  classNameMargin?: string
}

const fade = value => ( {
  toValue: value,
  duration: 2000,
  useNativeDriver: true
} );

const UploadCompleteAnimation = ( {
  wasSynced, observation, layout, white, classNameMargin
}: Props ): Node => {
  const fadeAnimation = useRef( new Animated.Value( 1 ) ).current;
  const enteringFadeAnimation = useRef( new Animated.Value( 0 ) ).current;
  const theme = useTheme( );

  useEffect( ( ) => {
    if ( wasSynced ) {
      Animated.sequence( [
        Animated.timing( fadeAnimation, fade( 0 ) ),
        Animated.timing( enteringFadeAnimation, fade( 1 ) )
      ] ).start( );
    }
  }, [wasSynced, fadeAnimation, enteringFadeAnimation] );

  return (
    <>
      {/* $FlowIgnore[prop-missing] */}
      <Animated.View
        style={{ opacity: fadeAnimation }}
        // position component fading out and component fading in on the same spot
        className={
          layout === "vertical"
            ? "absolute inset-0 flex justify-center items-center z-10"
            : "absolute bottom-8 left-2"
        }
      >
        <INatIcon
          size={33}
          name="upload-complete"
          color={layout === "vertical" ? theme.colors.secondary : theme.colors.onSecondary}
        />
      </Animated.View>
      <Animated.View style={{ opacity: enteringFadeAnimation }}>
        <ObsStatus
          observation={observation}
          layout={layout}
          white={white}
          classNameMargin={classNameMargin}
        />
      </Animated.View>
    </>
  );
};

export default UploadCompleteAnimation;
