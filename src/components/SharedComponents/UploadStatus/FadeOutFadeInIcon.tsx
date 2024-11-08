import classnames from "classnames";
import { View } from "components/styledComponents";
import React, { ReactNode } from "react";
import Reanimated, {
  FadeIn, Keyframe
} from "react-native-reanimated";

import UploadCompleteIcon from "./UploadCompleteIcon";

type Props = {
  iconWrapperClasses: Object;
  iconClasses: Array<string>;
  completeColor: string;
  layout: "horizontal" | "vertical";
  children: ReactNode;
  uniqueKey: string;
}
const AnimatedView = Reanimated.createAnimatedComponent( View );

const keyframe = new Keyframe( {
  0: { opacity: 0 },
  40: { opacity: 1 },
  100: { opacity: 0 }
} );

const FadeOutFadeInIcon = ( {
  iconWrapperClasses,
  iconClasses,
  completeColor,
  layout,
  children,
  uniqueKey
}: Props ) => {
  const fadeOutUploadCompleteIcon = (
    <AnimatedView
      entering={keyframe.duration( 2000 )}
      testID={`UploadIcon.complete.${uniqueKey}`}
    >
      <UploadCompleteIcon
        iconClasses={iconClasses}
        completeColor={completeColor}
      />
    </AnimatedView>
  );

  const fadeInObsStatusComponent = (
    <AnimatedView entering={FadeIn.duration( 1000 ).delay( 2000 )}>
      {children}
    </AnimatedView>
  );
  return (
    <>
      <View
        className={classnames( "absolute", {
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
