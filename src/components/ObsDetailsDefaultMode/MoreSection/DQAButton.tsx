import { useNavigation } from "@react-navigation/native";
import { Body3 } from "components/SharedComponents";
import { t } from "i18next";
import type { TabStackScreenProps } from "navigation/types";
import React from "react";
import { useCurrentUser } from "sharedHooks";

interface Props {
  observationUUID: string;
}

const DQAButton = ( { observationUUID }: Props ) => {
  const navigation = useNavigation<TabStackScreenProps<"ObsDetails">["navigation"]>( );
  const currentUser = useCurrentUser( );

  if ( !currentUser ) {
    return null;
  }
  return (
    <Body3
      className="underline mt-[11px]"
      onPress={() => navigation.navigate( "DataQualityAssessment", { observationUUID } )}
    >
      {t( "Data-Quality-Assessment" )}
    </Body3>
  );
};

export default DQAButton;
