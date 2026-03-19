import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { ApiProject } from "api/types";
import { fetchUserProjects } from "api/users";
import {
  Body1,
  ViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useEffect } from "react";
import Observation from "realmModels/Observation";
import {
  useAuthenticatedQuery,
  useRemoteObservation,
  useTranslation,
} from "sharedHooks";

import ProjectList from "./ProjectList";

interface ProjectListRouteParams {
  [name: string]: {
    observationUuid?: string;
    userId?: number;
    headerOptions: {
      headerTitle?: string;
      headerSubtitle?: string;
    };
  };
}

const ProjectListContainer = ( ) => {
  const navigation = useNavigation( );
  const { params } = useRoute<RouteProp<ProjectListRouteParams, "ProjectList">>( );
  const { observationUuid, userId, headerOptions } = params;
  const { t } = useTranslation( );

  const { remoteObservation } = useRemoteObservation(
    observationUuid,
    !!observationUuid,
  );

  const traditionalProjects = remoteObservation?.project_observations?.map(
    p => p.project,
  ) || [];
  const nonTraditionalProjects = remoteObservation?.non_traditional_projects?.map(
    p => p.project,
  ) || [];
  const observationProjects = traditionalProjects.concat( nonTraditionalProjects );

  const { data: userProjects } = useAuthenticatedQuery(
    ["fetchUserProjects", `${userId}`],
    optsWithAuth => fetchUserProjects(
      {
        id: userId,
        per_page: 200,
        fields: Observation.PROJECT_FIELDS,
      },
      optsWithAuth,
    ),
    { enabled: !!userId },
  );

  const projects: ApiProject[] = observationUuid
    ? observationProjects
    : ( userProjects ?? [] );

  useEffect( ( ) => {
    navigation.setOptions( headerOptions );
  }, [headerOptions, navigation] );

  return (
    <ViewWrapper useTopInset={false}>
      <View className="border-b border-lightGray mt-5" />
      <ProjectList
        projects={projects}
        ListEmptyComponent={(
          <View className="self-center mt-5 p-4">
            <Body1 className="align-center text-center">
              {t( "This-user-has-not-joined-any-projects" )}
            </Body1>
          </View>
        )}
      />
    </ViewWrapper>
  );
};

export default ProjectListContainer;
