import { useNavigation } from "@react-navigation/native";
import {
  Button,
  Divider,
  Heading4
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React, { useMemo } from "react";

const headingClass = "mt-[20px] mb-[11px] text-darkGray";
const sectionClass = "mx-[15px] mb-[20px]";

// TODO: can we get a centralized type/interface for our realm objects, here observation and project
interface Props {
  observation: {
    project_observations: Array<{
      project: object;
    }>;
    non_traditional_projects: Array<{
      project: object;
    }>;
  }
}

const ProjectSection = ( { observation }: Props ) => {
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
      projectCount: totalProjectCount
    } )
  } ), [totalProjectCount] );

  if ( totalProjectCount === 0 || typeof totalProjectCount !== "number" ) {
    return null;
  }

  return (
    <>
      <View className={sectionClass}>
        <Heading4 className={headingClass}>
          {t( "PROJECTS-X", {
            projectCount: totalProjectCount
          } )}
        </Heading4>
        <Button
          text={t( "VIEW-PROJECTS" )}
          onPress={( ) => navigation.navigate( "ProjectList", {
            projects: allProjects,
            headerOptions
          } )}
        />
      </View>
      <Divider />
    </>
  );
};

export default ProjectSection;
