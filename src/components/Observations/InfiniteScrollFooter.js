// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { ActivityIndicator } from "react-native";

type Props = {
  view: string,
  isLoading: boolean
}

const InfiniteScrollFooter = ( { view, isLoading }: Props ): Node => {
  const className = `${view === "grid" ? "h-64" : "h-32"} border-t border-lightGray py-16`;
  if ( isLoading ) {
    return (
      <View className={className}>
        <ActivityIndicator />
      </View>
    );
  }
  return <View className={className} />;
};

export default InfiniteScrollFooter;
