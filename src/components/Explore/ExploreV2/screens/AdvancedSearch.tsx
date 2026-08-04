import { Body2, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

const AdvancedSearch = ( ) => {
  const { t } = useTranslation( );

  return (
    <ViewWrapper testID="AdvancedSearch">
      <View className="flex-1 items-center justify-center p-4">
        <Body2>{t( "ADVANCED-SEARCH" )}</Body2>
      </View>
    </ViewWrapper>
  );
};

export default AdvancedSearch;
