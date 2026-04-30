import { Body2, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { useExploreV2 } from "providers/ExploreV2Context";
import React from "react";

const AdvancedSearch = ( ) => {
  useExploreV2( );
  return (
    <ViewWrapper testID="AdvancedSearch">
      <View className="flex-1 items-center justify-center p-4">
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <Body2>TODO: Advanced Search — MOB-1346</Body2>
      </View>
    </ViewWrapper>
  );
};

export default AdvancedSearch;
