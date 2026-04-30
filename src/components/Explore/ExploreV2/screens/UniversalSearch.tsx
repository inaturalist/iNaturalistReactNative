import { Body2, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { useExploreV2 } from "providers/ExploreV2Context";
import React from "react";

const UniversalSearch = ( ) => {
  useExploreV2( );
  return (
    <ViewWrapper testID="UniversalSearch">
      <View className="flex-1 items-center justify-center p-4">
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <Body2>TODO: Universal Search — MOB-1338</Body2>
      </View>
    </ViewWrapper>
  );
};

export default UniversalSearch;
