import useOneTimeTip, { CAMERA_TIP } from "components/Camera/hooks/useOneTimeTip";
import CameraTip from "components/Camera/Tips/CameraTip";
import React, { useEffect } from "react";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
  // Whether a photo has been taken in this instance of the camera
  hasNewPhotos: boolean;
}

// Shown at the top of the multi-capture camera view until the first photo is
// taken, then never again
const MultiCaptureTip = ( { hasNewPhotos }: Props ) => {
  const { t } = useTranslation( );
  const { markShown, shouldShow } = useOneTimeTip( CAMERA_TIP.MULTI_CAPTURE );

  useEffect( ( ) => {
    if ( shouldShow && hasNewPhotos ) markShown( );
  }, [hasNewPhotos, markShown, shouldShow] );

  if ( !shouldShow ) return null;

  return (
    <CameraTip
      className="absolute top-4 self-center mx-5"
      testID="MultiCaptureTip"
      text={t( "Take-photos-from-different-angles-to-help-with-identification" )}
    />
  );
};

export default MultiCaptureTip;
