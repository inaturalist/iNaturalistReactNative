import classnames from "classnames";
import Body2 from "components/SharedComponents/Typography/Body2";
import { View } from "components/styledComponents";
import React, { useEffect } from "react";
import { AccessibilityInfo } from "react-native";

interface Props {
  // Adds an arrow on that side of the bubble, pointing away from it
  arrow?: "right";
  // Positions the tip; it has no position of its own
  className?: string;
  testID?: string;
  text: string;
}

// A white text bubble over the camera. Touches pass through it, so it never
// blocks a camera control, and its text is announced to screen readers when
// it appears
const CameraTip = ( {
  arrow, className, testID, text,
}: Props ) => {
  useEffect( ( ) => {
    AccessibilityInfo.announceForAccessibility( text );
  }, [text] );

  return (
    <View
      className={classnames( "flex-row items-center", className )}
      pointerEvents="none"
      testID={testID}
    >
      <View className="shrink bg-white rounded-2xl px-5 py-4">
        <Body2>{text}</Body2>
      </View>
      {arrow === "right" && (
        <View
          className={classnames(
            "border-t-[10px] border-b-[10px] border-y-[#00000000]",
            "border-l-[16px] border-l-white",
          )}
        />
      )}
    </View>
  );
};

export default CameraTip;
