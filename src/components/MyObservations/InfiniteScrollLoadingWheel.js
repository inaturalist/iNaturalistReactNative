// @flow

import classnames from "classnames";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { ActivityIndicator } from "react-native";

type Props = {
  isFetchingNextPage?: boolean,
  currentUser: ?Object,
  layout: string
}

const InfiniteScrollLoadingWheel = ( {
  isFetchingNextPage, currentUser, layout
}: Props ): Node => {
  const loadingWheelClass = "h-64 py-16";
  if ( !isFetchingNextPage || !currentUser ) {
    return <View className={loadingWheelClass} />;
  }
  return (
    <View className={classnames( loadingWheelClass, {
      "border-t border-lightGray": layout === "list"
    } )}
    >
      <ActivityIndicator />
    </View>
  );
};

export default InfiniteScrollLoadingWheel;
