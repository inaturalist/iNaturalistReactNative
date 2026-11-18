import classnames from "classnames";
import Body2 from "components/SharedComponents/Typography/Body2";
import { View } from "components/styledComponents";
import React, { useEffect } from "react";
import { AccessibilityInfo } from "react-native";

interface Props {
  // Adds an arrow under the bubble's right corner, pointing down
  arrow?: "down-right";
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
      className={classnames( "items-end", className )}
      pointerEvents="none"
      testID={testID}
    >
      <View
        className={classnames(
          "bg-white rounded-2xl px-5 py-4",
          { "rounded-br-none": arrow === "down-right" },
        )}
      >
        <Body2>{text}</Body2>
      </View>
      {arrow === "down-right" && (
        <View
          className={classnames(
            "border-l-[10px] border-r-[10px] border-x-[#00000000]",
            "border-t-[16px] border-t-white",
          )}
        />
      )}
    </View>
  );
};

export default CameraTip;
