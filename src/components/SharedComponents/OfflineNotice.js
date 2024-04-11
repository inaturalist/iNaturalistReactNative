// @flow
import {
  Body2,
  INatIcon
} from "components/SharedComponents";
import { Pressable } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  onPress: Function
};

const OfflineNotice = ( {
  onPress
}: Props ): Node => {
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
      />
      <Body2 className="mt-[30px]">{ t( "You-are-offline-Tap-to-try-again" ) }</Body2>
    </Pressable>
  );
};

export default OfflineNotice;
