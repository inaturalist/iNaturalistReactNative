import { useNavigation } from "@react-navigation/native";
import { Body3 } from "components/SharedComponents";
import { t } from "i18next";
import type { TabStackScreenProps } from "navigation/types";
import React from "react";

interface Props {
  observation: {
    uuid: string;
    project_observations?: object[];
    non_traditional_projects?: object[];
  };
}

const ProjectButton = ( { observation }: Props ) => {
  const navigation = useNavigation<TabStackScreenProps<"ObsDetails">["navigation"]>( );

  const traditionalProjectCount = observation?.project_observations?.length || 0;
  const nonTraditionalProjectCount = observation?.non_traditional_projects?.length || 0;

  const totalProjectCount = traditionalProjectCount + nonTraditionalProjectCount;

  if ( totalProjectCount === 0 || typeof totalProjectCount !== "number" ) {
    return null;
  }

  return (
    <Body3
      className="underline mt-[11px]"
      onPress={( ) => navigation.navigate( "ProjectList", {
        observationUuid: observation.uuid,
      } )}
    >
      {t( "Projects" )}
    </Body3>
  );
};

export default ProjectButton;
