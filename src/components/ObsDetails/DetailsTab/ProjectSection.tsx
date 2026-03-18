import { useNavigation } from "@react-navigation/native";
import {
  Button,
  Divider,
  Heading4,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React, { useMemo } from "react";

const headingClass = "mt-[20px] mb-[11px] text-darkGray";
const sectionClass = "mx-[15px] mb-[20px]";

// TODO: can we get a centralized type/interface for our realm objects, here observation and project
interface Props {
  observation: {
    uuid: string;
    project_observations: {
      project: object;
    }[];
    non_traditional_projects: {
      project: object;
    }[];
  };
}

const ProjectSection = ( { observation }: Props ) => {
  const navigation = useNavigation( );

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
    <>
      <View className={sectionClass}>
        <Heading4 className={headingClass}>
          {t( "PROJECTS-X", {
            projectCount: totalProjectCount,
          } )}
        </Heading4>
        <Button
          text={t( "VIEW-PROJECTS" )}
          onPress={( ) => navigation.navigate( "ProjectList", {
            observationUuid: observation.uuid,
            headerOptions,
          } )}
        />
      </View>
      <Divider />
    </>
  );
};

export default ProjectSection;
