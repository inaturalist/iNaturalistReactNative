import {
  Body1,
  Heading5,
  Tabs,
} from "components/SharedComponents";
import type { TabComponentProps } from "components/SharedComponents/Tabs/Tabs";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

const OBSERVATIONS_TAB = "observations";
const SPECIES_TAB = "species";

interface Props {
  observationsCount?: number | null;
  speciesCount?: number | null;
}

// switching between observations and species views is deferred to MOB-1332.
const ExploreV2Tabs = ( { observationsCount, speciesCount }: Props ) => {
  const { t } = useTranslation( );

  const renderTabComponent = ( { id }: TabComponentProps ) => {
    const isObservations = id === OBSERVATIONS_TAB;
    const stat = isObservations
      ? observationsCount
      : speciesCount;
    const label = isObservations
      ? t( "X-OBSERVATIONS--below-number", { count: observationsCount ?? 0 } )
      : t( "X-SPECIES--below-number", { count: speciesCount ?? 0 } );
    return (
      <View className="items-center py-1.5">
        <Body1 className="mb-[4px]">
          {typeof stat === "number"
            ? t( "Intl-number", { val: stat } )
            : "--"}
        </Body1>
        <Heading5>{label}</Heading5>
      </View>
    );
  };

  return (
    <View testID="ExploreV2Tabs">
      <Tabs
        activeColor={String( colors?.inatGreen )}
        activeId={OBSERVATIONS_TAB}
        tabs={[
          {
            id: OBSERVATIONS_TAB,
            text: t( "Observations" ),
            testID: "ExploreV2Tabs.observations",
            onPress: ( ) => undefined, // MOB-1332
          },
          {
            id: SPECIES_TAB,
            text: t( "Species" ),
            testID: "ExploreV2Tabs.species",
            onPress: ( ) => undefined, // MOB-1332
          },
        ]}
        TabComponent={renderTabComponent}
      />
    </View>
  );
};

export default ExploreV2Tabs;
