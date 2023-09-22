// @flow

import classnames from "classnames";
import { Body2 } from "components/SharedComponents";
import {
  CIRCLE_BUTTON_DIM
} from "components/SharedComponents/Buttons/TransparentCircleButton";
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
  zoomTextValue: number
}

const CameraZoom = ( {
  changeZoom,
  cameraZoomClasses,
  zoomTextValue
}: Props ): Node => {
  const { t } = useTranslation( );

  const zoomButtonText = `${zoomTextValue}x`;

  return (
    <Pressable
      className={classnames( circleOptionsClasses, cameraZoomClasses )}
      onPress={changeZoom}
      accessibilityRole="button"
      accessibilityLabel={t( "Camera-button-zoom" )}
      accessibilityState={{ disabled: false }}
      size={20}
    >
      <Body2 className="text-white">{zoomButtonText}</Body2>
    </Pressable>
  );
};

export default CameraZoom;
