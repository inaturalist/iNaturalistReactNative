import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { ReactNode } from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import FadeOutFadeInIcon from "./FadeOutFadeInIcon";
import ProgressArrow from "./ProgressArrow";
import UploadCompleteIcon from "./UploadCompleteIcon";
import UploadProgressIcon from "./UploadProgressIcon";
import UploadQueuedRotatingIcon from "./UploadQueuedRotatingIcon";
import UploadStartIcon from "./UploadStartIcon";

const iconClasses = [
  "items-center",
  "justify-center",
  "w-[44px]",
  "h-[44px]"
];

type Props = {
  white: boolean,
  layout: "horizontal" | "vertical";
  children: ReactNode;
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

  const showProgressArrow = ( ) => (
    <ProgressArrow
      layout={layout}
      color={color}
      progress={progress}
      uniqueKey={uniqueKey}
    />
  );

  const iconWrapperClasses = classnames( {
    "items-center justify-center w-[49px]": layout === "vertical"
  } );

  const displayUploadStatus = ( ) => {
    if ( progress === 0 && !queued ) {
      if ( needsEdit ) {
        return (
          <View className={iconWrapperClasses}>
            <INatIconButton
              icon="pencil"
              color={color}
              size={15}
              onPress={onPress}
              disabled={false}
              accessibilityLabel={t( "Edit-Observation" )}
            />
          </View>
        );
      }
      return (
        <View className={iconWrapperClasses}>
          <UploadStartIcon
            color={color}
            uploadSingleObservation={onPress}
            uniqueKey={uniqueKey}
          />
        </View>
      );
    }
    if ( progress === 0 && queued ) {
      return (
        <View className={iconWrapperClasses}>
          <UploadQueuedRotatingIcon
            color={color}
            showProgressArrow={showProgressArrow}
            iconClasses={iconClasses}
          />
        </View>
      );
    }
    if ( progress < 1 ) {
      return (
        <View className={iconWrapperClasses}>
          <UploadProgressIcon
            color={color}
            progress={progress}
            showProgressArrow={showProgressArrow}
            iconClasses={iconClasses}
          />
        </View>
      );
    }
    // Test of end state before animation
    if ( progress === 10 ) {
      return (
        <View className={iconWrapperClasses}>
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
        <View className="justify-center">
          <View
            className={classnames( "absolute", {
              "bottom-0": layout === "horizontal"
            } )}
          >
            <View className={iconWrapperClasses}>
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
        iconWrapperClasses={iconWrapperClasses}
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
      className={classnames( {
        "h-[44px] justify-end": layout === "horizontal",
        "justify-center": layout !== "horizontal"
      } )}
    >
      {displayUploadStatus( )}
    </View>
  );
};
export default UploadStatus;
