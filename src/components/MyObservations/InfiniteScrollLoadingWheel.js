// @flow

import classnames from "classnames";
import { Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { ActivityIndicator } from "react-native";
import { useIsConnected, useTranslation } from "sharedHooks";

type Props = {
  isFetchingNextPage?: boolean,
  currentUser?: ?Object,
  layout?: string
}

const InfiniteScrollLoadingWheel = ( {
  isFetchingNextPage, currentUser, layout
}: Props ): Node => {
  const isOnline = useIsConnected( );
  const { t } = useTranslation( );

  const loadingWheelClass = "h-64 py-16";
  if ( !isFetchingNextPage || !currentUser ) {
    return <View className={loadingWheelClass} />;
  }
  return (
    <View className={classnames( loadingWheelClass, {
      "border-t border-lightGray": layout === "list"
    } )}
    >
      {!isOnline
        ? (
          <Body3 className="text-center">
            {t( "An-Internet-connection-is-required" )}
          </Body3>
        )
        : <ActivityIndicator />}
    </View>
  );
};

export default InfiniteScrollLoadingWheel;
