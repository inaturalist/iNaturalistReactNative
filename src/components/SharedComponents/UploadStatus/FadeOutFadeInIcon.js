import classnames from "classnames";
import { View } from "components/styledComponents";
import React, { ReactComponent } from "react";
import Reanimated, {
  FadeIn, Keyframe
} from "react-native-reanimated";

type Props = {
  iconWrapperClasses: string;
  layout: "horizontal" | "vertical";
  fadeInIcon: ReactComponent;
  fadeOutIcon: ReactComponent;
};
const AnimatedView = Reanimated.createAnimatedComponent( View );

const keyframe = new Keyframe( {
  0: { opacity: 0 },
  40: { opacity: 1 },
  100: { opacity: 0 }
} );

const FadeOutFadeInIcon = ( {
  iconWrapperClasses,
  layout,
  fadeInIcon,
  fadeOutIcon
}: Props ) => {
  const fadeOutUploadCompleteIcon = (
    <AnimatedView
      entering={keyframe.duration( 2000 )}
    >
      {fadeOutIcon}
    </AnimatedView>
  );

  const fadeInObsStatusComponent = (
    <AnimatedView entering={FadeIn.duration( 1000 ).delay( 2000 )}>
      {fadeInIcon}
    </AnimatedView>
  );
  return (
    <>
      <View
        className={classnames( "absolute h-full justify-center", {
          "bottom-0": layout === "horizontal"
        } )}
      >
        <View className={iconWrapperClasses}>
          {fadeOutUploadCompleteIcon}
        </View>
      </View>
      {fadeInObsStatusComponent}
    </>
  );
};
export default FadeOutFadeInIcon;
