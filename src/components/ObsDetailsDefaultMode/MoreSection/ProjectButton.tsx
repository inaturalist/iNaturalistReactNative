import type { ParamListBase } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ApiObservation } from "api/types";
import { Body3 } from "components/SharedComponents";
import { t } from "i18next";
import React, { useMemo } from "react";

interface Props {
  observation: ApiObservation;
}

const ProjectButton = ( { observation }: Props ) => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>( );

  const traditionalProjectCount = observation?.project_observations?.length || 0;
  const nonTraditionalProjectCount = observation?.non_traditional_projects?.length || 0;

  const totalProjectCount = traditionalProjectCount + nonTraditionalProjectCount;

  const headerOptions = useMemo( ( ) => ( {
    headerTitle: t( "Observation" ),
    headerSubtitle: t( "X-PROJECTS", {
      projectCount: totalProjectCount,
    } ),
  } ), [totalProjectCount] );

  if ( totalProjectCount === 0 || typeof totalProjectCount !== "number" ) {
    return null;
  }

  return (
    <Body3
      className="underline mt-[11px]"
      onPress={( ) => navigation.navigate( "ProjectList", {
        observationUuid: observation.uuid,
        headerOptions,
      } )}
    >
      {t( "Projects" )}
    </Body3>
  );
};

export default ProjectButton;
