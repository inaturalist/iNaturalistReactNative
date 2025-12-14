import classnames from "classnames";
import { ActivityIndicator, Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  layout?: string;
  isConnected?: boolean | null;
  hideLoadingWheel: boolean;
  explore?: boolean;
}

const InfiniteScrollLoadingWheel = ( {
  hideLoadingWheel,
  isConnected = true,
  layout,
  explore = false
}: Props ) => {
  const { t } = useTranslation( );

  const loadingWheelClass = explore
    ? "h-[128px] py-16"
    : "h-64 py-16";
  if ( hideLoadingWheel ) {
    return <View className={loadingWheelClass} testID="InfiniteScrollLoadingWheel.footerView" />;
  }
  return (
    <View className={classnames( loadingWheelClass, {
      "border-t border-lightGray": layout === "list"
    } )}
    >
      {isConnected === false
        ? (
          <Body3 className="text-center">
            {t( "An-Internet-connection-is-required" )}
          </Body3>
        )
        : (
          <ActivityIndicator
            testID="InfiniteScrollLoadingWheel.loading"
            size={25}
          />
        )}
    </View>
  );
};

export default InfiniteScrollLoadingWheel;
