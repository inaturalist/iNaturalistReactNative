import useOneTimeTip, {
  CAMERA_TIP,
  useUploadCoachmark,
} from "components/Camera/hooks/useOneTimeTip";
import GoodObservationSheet from "components/Camera/Tips/GoodObservationSheet";
import { View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React, { useEffect } from "react";

// Wraps the AI camera to run its one-time tips: the good-observation sheet
// first, then the upload coachmark (rendered by UploadCoachmark, next to the
// photo library button)
const AICameraTips = ( { children }: PropsWithChildren ) => {
  const {
    markShown: markSheetShown,
    shouldShow: showSheet,
  } = useOneTimeTip( CAMERA_TIP.GOOD_OBSERVATION_SHEET );
  const {
    markShown: markCoachmarkShown,
    shouldShow: showCoachmark,
  } = useUploadCoachmark( );

  // Leaving the camera also counts as having seen the coachmark. Screen
  // readers activate controls without the touch that dismisses it below
  useEffect( ( ) => ( ) => {
    if ( showCoachmark ) markCoachmarkShown( );
  }, [markCoachmarkShown, showCoachmark] );

  return (
    // onTouchStart sees every touch on the camera without claiming it, so the
    // tap that dismisses the coachmark still reaches the control underneath.
    // This View is always rendered so the camera isn't remounted when the
    // coachmark goes away
    <View
      className="flex-1"
      onTouchStart={showCoachmark
        ? markCoachmarkShown
        : undefined}
    >
      {children}
      {showSheet && <GoodObservationSheet onDismiss={markSheetShown} />}
    </View>
  );
};

export default AICameraTips;
