// @flow

import classnames from "classnames";
import {
  CIRCLE_BUTTON_DIM
} from "components/SharedComponents/Buttons/TransparentCircleButton";
import INatText from "components/SharedComponents/Typography/INatText";
import { Pressable } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

const circleOptionsClasses = [
  "bg-black/50",
  `h-[${CIRCLE_BUTTON_DIM}px]`,
  "items-center",
  "justify-center",
  "rounded-full",
  `w-[${CIRCLE_BUTTON_DIM}px]`
].join( " " );

type Props = {
  changeZoom: Function,
  cameraZoomClasses?: string,
  zoomTextValue: string,
  showZoomButton: boolean
}

const CameraZoom = ( {
  changeZoom,
  cameraZoomClasses,
  zoomTextValue,
  showZoomButton
}: Props ): Node => {
  const { t } = useTranslation();

  if ( !showZoomButton ) {
    return null;
  }

  const zoomButtonText = `${zoomTextValue}×`;

  return (
    <Pressable
      className={classnames( circleOptionsClasses, cameraZoomClasses )}
      onPress={changeZoom}
      accessibilityRole="button"
      accessibilityLabel={t( "Camera-button-zoom" )}
      accessibilityState={{ disabled: false }}
      size={20}
    >
      <INatText className="text-s font-semibold text-white">
        {zoomButtonText}
      </INatText>
    </Pressable>
  );
};

export default CameraZoom;
