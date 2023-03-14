// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { ActivityIndicator } from "react-native";

type Props = {
  isLoading?: boolean,
  currentUser: ?Object
}

const InfiniteScrollLoadingWheel = ( { isLoading, currentUser }: Props ): Node => {
  const className = "h-64 border-t border-border py-16";
  if ( !isLoading || !currentUser ) {
    return <View className="h-64 py-16" />;
  }
  return (
    <View className={className}>
      <ActivityIndicator />
    </View>
  );
};

export default InfiniteScrollLoadingWheel;
