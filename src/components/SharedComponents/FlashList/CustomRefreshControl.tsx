import React from "react";
import { RefreshControl } from "react-native";

const CustomRefreshControl = ( {
  accessibilityLabel,
  refreshing,
  onRefresh,
  ...props
} ) => (
  <RefreshControl
    accessibilityLabel={accessibilityLabel}
    onRefresh={onRefresh}
    refreshing={refreshing}
    // 20241121 amanda - added some opacity to try to lighten up the
    // darkest version of the ActivityIndicator when a user is at
    // full pull-to-refresh. if that doesn't look inatGreen enough,
    // maybe we stick to light gray here
    tintColor="#74AC0066"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default CustomRefreshControl;
