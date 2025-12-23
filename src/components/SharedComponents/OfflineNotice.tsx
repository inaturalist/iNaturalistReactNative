import classnames from "classnames";
import {
  Body2,
  INatIcon,
} from "components/SharedComponents";
import { Pressable } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  color?: string;
  onPress: () => void;
}

const OfflineNotice = ( {
  color,
  onPress,
}: Props ) => {
  const { t } = useTranslation( );
  if ( typeof ( onPress ) !== "function" ) {
    throw new Error( "OfflineNotice needs an onPress function" );
  }
  return (
    <Pressable
      accessibilityLabel={t( "Internet-Connection-Required" )}
      accessibilityHint={t( "Loads-content-that-requires-an-Internet-connection" )}
      onPress={onPress}
      className="justify-center items-center w-full h-full"
    >
      <INatIcon
        name="offline"
        size={72}
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no"
        color={color}
      />
      <Body2
        className={classnames(
          "mt-[30px]",
          color
            ? `text-${color}`
            : "text-darkGray",
        )}
      >
        { t( "You-are-offline-Tap-to-try-again" ) }
      </Body2>
    </Pressable>
  );
};

export default OfflineNotice;
