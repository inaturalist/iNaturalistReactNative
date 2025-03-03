import classnames from "classnames";
import { CircleDots, INatIcon, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { PropsWithChildren } from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import FadeOutFadeInIcon from "./FadeOutFadeInIcon";
import UploadCompleteIcon from "./UploadCompleteIcon";
import UploadProgressIcon from "./UploadProgressIcon";

const iconClasses = [
  "items-center",
  "justify-center",
  "w-[44px]",
  "h-[44px]"
];

interface Props extends PropsWithChildren {
  white: boolean;
  layout: "horizontal" | "vertical";
  needsEdit?: boolean;
  onPress: ( ) => void;
  progress: number;
  uniqueKey: string;
  queued: boolean;
}

const UploadStatus = ( {
  white = false,
  layout,
  children,
  needsEdit,
  onPress,
  progress,
  uniqueKey,
  queued
}: Props ) => {
  const { t } = useTranslation( );
  const completeColor = ( white
    ? colors.white
    : colors.inatGreen ) as string;
  const color = ( white
    ? colors.white
    : colors.darkGray ) as string;

  const accessibilityLabelText = ( ) => {
    if ( progress < 0.05 ) {
      return t( "Saved-Observation" );
    }
    if ( progress < 1 ) {
      return t( "Upload-Progress", { uploadProgress: progress * 100 } );
    }
    return t( "Upload-Complete" );
  };

  const wrapperClassName = layout === "vertical"
    ? classnames( "items-center justify-center w-[49px]" )
    : "w-[44px]";

  const displayUploadStatus = ( ) => {
    if ( progress === 0 && !queued ) {
      return (
        <View className={wrapperClassName}>
          <INatIconButton
            accessibilityLabel={
              needsEdit
                ? t( "Edit-Observation" )
                : t( "Start-upload" )
            }
            testID={
              needsEdit
                ? `UploadIcon.needsEdit.${uniqueKey}`
                : `UploadIcon.start.${uniqueKey}`
            }
            onPress={onPress}
          >
            <CircleDots
              color={color}
              className={classnames( iconClasses )}
            >
              <INatIcon
                name={
                  needsEdit
                    ? "pencil"
                    : "upload-arrow"
                }
                color={color}
                size={15}
              />
            </CircleDots>
          </INatIconButton>
        </View>
      );
    }

    if ( progress === 0 && queued ) {
      return (
        <View className={wrapperClassName}>
          <CircleDots
            animated
            color={color}
            className={classnames( iconClasses )}
          >
            <INatIcon
              name="upload-arrow"
              color={color}
              size={15}
            />
          </CircleDots>
        </View>
      );
    }

    if ( progress < 1 ) {
      return (
        <View className={wrapperClassName}>
          <UploadProgressIcon
            color={color}
            progress={progress}
            iconClasses={iconClasses}
            uniqueKey={uniqueKey}
          />
        </View>
      );
    }
    // Test of end state before animation
    if ( progress === 10 ) {
      return (
        <View className={wrapperClassName}>
          <UploadCompleteIcon
            iconClasses={iconClasses}
            completeColor={completeColor}
          />
        </View>
      );
    }
    // Test of end state with all elements overlayed
    if ( progress === 11 ) {
      return (
        <View>
          <View
            className={classnames( "absolute", "h-full justify-center", {
              "bottom-0": layout === "horizontal"
            } )}
          >
            <View className={wrapperClassName}>
              <UploadCompleteIcon
                iconClasses={iconClasses}
                completeColor={completeColor}
              />
            </View>
          </View>
          {children}
        </View>
      );
    }
    return (
      <FadeOutFadeInIcon
        iconWrapperClasses={wrapperClassName}
        iconClasses={iconClasses}
        completeColor={completeColor}
        layout={layout}
        uniqueKey={uniqueKey}
      >
        {children}
      </FadeOutFadeInIcon>
    );
  };

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabelText( )}
      className={classnames(
        "justify-center",
        layout === "horizontal"
          ? "h-[44px]"
          : "h-[65px]"
      )}
    >
      {displayUploadStatus( )}
    </View>
  );
};
export default UploadStatus;
