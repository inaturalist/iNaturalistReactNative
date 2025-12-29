import classnames from "classnames";
import { CircleDots, INatIcon, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { PropsWithChildren, ReactComponent } from "react";
import React from "react";
import { useLayoutPrefs, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import FadeOutFadeInIcon from "./FadeOutFadeInIcon";
import FadeOutIcon from "./FadeOutIcon";
import UploadCompleteIcon from "./UploadCompleteIcon";
import UploadProgressIcon from "./UploadProgressIcon";

const iconClasses = [
  "items-center",
  "justify-center",
  "w-[44px]",
  "h-[44px]",
];

interface Props extends PropsWithChildren {
  white: boolean;
  layout: "horizontal" | "vertical";
  needsEdit?: boolean;
  onPress: ( ) => void;
  progress: number;
  uniqueKey: string;
  queued: boolean;
  obsStatus: ReactComponent;
}

const UploadStatus = ( {
  white = false,
  layout,
  needsEdit,
  onPress,
  progress,
  uniqueKey,
  queued,
  obsStatus,
}: Props ) => {
  const { isDefaultMode } = useLayoutPrefs();
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

    if ( !isDefaultMode && layout === "vertical" ) {
      return (
        <FadeOutFadeInIcon
          uniqueKey={uniqueKey}
          fadeOutIcon={(
            <View className={wrapperClassName}>
              <UploadCompleteIcon
                iconClasses={iconClasses}
                completeColor={completeColor}
              />
            </View>
          )}
          fadeInIcon={<View className={wrapperClassName}>{obsStatus}</View>}
        />
      );
    }

    return (
      <FadeOutIcon
        uniqueKey={uniqueKey}
      >
        <View className={wrapperClassName}>
          <UploadCompleteIcon
            iconClasses={iconClasses}
            completeColor={completeColor}
          />
        </View>
      </FadeOutIcon>
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
          : "h-[65px]",
      )}
    >
      {displayUploadStatus( )}
    </View>
  );
};
export default UploadStatus;
