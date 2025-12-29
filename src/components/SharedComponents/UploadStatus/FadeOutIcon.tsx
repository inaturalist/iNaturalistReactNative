import { View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React from "react";
import Reanimated, {
  Keyframe,
} from "react-native-reanimated";

interface Props extends PropsWithChildren {
  uniqueKey: string;
}
const AnimatedView = Reanimated.createAnimatedComponent( View );

const keyframe = new Keyframe( {
  0: { opacity: 0 },
  40: { opacity: 1 },
  100: { opacity: 0 },
} );

const FadeOutIcon = ( {
  children,
  uniqueKey,
}: Props ) => (
  <AnimatedView
    entering={keyframe.duration( 2000 )}
    testID={`UploadIcon.complete.${uniqueKey}`}
  >
    {children}
  </AnimatedView>
);
export default FadeOutIcon;
