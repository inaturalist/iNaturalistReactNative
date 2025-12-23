import { useNavigation } from "@react-navigation/native";
import { Body3 } from "components/SharedComponents";
import { t } from "i18next";
import React, { useMemo } from "react";

// TODO: can we get a centralized type/interface for our realm objects, here observation and project
interface Props {
  observation: {
    project_observations: {
      project: object;
    }[];
    non_traditional_projects: {
      project: object;
    }[];
  };
}

const ProjectButton = ( { observation }: Props ) => {
  const navigation = useNavigation( );

  const traditionalProjects = observation?.project_observations?.map( p => p.project ) || [];
  const nonTraditionalProjects = observation?.non_traditional_projects?.map( p => p.project ) || [];

  const traditionalProjectCount = traditionalProjects.length;
  const nonTraditionalProjectCount = nonTraditionalProjects.length;

  const totalProjectCount = traditionalProjectCount + nonTraditionalProjectCount;
  const allProjects = traditionalProjects.concat( nonTraditionalProjects );

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
        projects: allProjects,
        headerOptions,
      } )}
    >
      {t( "Projects" )}
    </Body3>
  );
};

export default ProjectButton;
