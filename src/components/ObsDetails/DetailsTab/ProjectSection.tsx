import type { ParamListBase } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ApiObservation } from "api/types";
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

interface Props {
  observation: Pick<ApiObservation, "uuid" | "project_observations" | "non_traditional_projects">;
}

const ProjectSection = ( { observation }: Props ) => {
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
