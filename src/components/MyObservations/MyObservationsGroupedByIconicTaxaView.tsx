import useIconicTaxaObservationCounts
  from "components/MyObservations/hooks/useIconicTaxaObservationCounts";
import { Body1, Body3 } from "components/SharedComponents";
import { ScrollView, View } from "components/styledComponents";
import React from "react";

const MyObservationsGroupedByIconicTaxaView = ( ) => {
  const counts = useIconicTaxaObservationCounts( );

  return (
    <View className="flex-1 items-center justify-center">
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <Body1>Grouped by iconic taxa view coming soon</Body1>
      <ScrollView className="w-full px-4">
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <Body3>
          {JSON.stringify( counts, null, 2 )}
        </Body3>
      </ScrollView>
    </View>
  );
};

export default MyObservationsGroupedByIconicTaxaView;
