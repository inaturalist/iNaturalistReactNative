import { useNavigation, useRoute } from "@react-navigation/native";
import type { ApiProject } from "api/types";
import { fetchUserProjects } from "api/users";
import {
  ActivityIndicator,
  Body1,
  ViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { TabStackScreenProps } from "navigation/types";
import React, { useEffect, useMemo } from "react";
import Observation from "realmModels/Observation";
import {
  useAuthenticatedQuery,
  useRemoteObservation,
  useTranslation,
} from "sharedHooks";

import ProjectList from "./ProjectList";

const ProjectListContainer = ( ) => {
  const navigation = useNavigation<TabStackScreenProps<"ProjectList">["navigation"]>( );
  const { params } = useRoute<TabStackScreenProps<"ProjectList">["route"]>( );
  const { observationUuid, userId, userLogin } = params;
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

  const { data: userProjects, isLoading: userProjectsLoading } = useAuthenticatedQuery(
    ["fetchUserProjects", userId],
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

  const headerOptions = useMemo( ( ) => {
    if ( observationUuid ) {
      if ( !remoteObservation ) return null;
      const projectCount = ( remoteObservation.project_observations?.length || 0 )
        + ( remoteObservation.non_traditional_projects?.length || 0 );
      return {
        headerTitle: t( "Observation" ),
        headerSubtitle: t( "X-PROJECTS", { projectCount } ),
      };
    }
    if ( !userProjects ) return null;
    return {
      headerTitle: userLogin,
      headerSubtitle: t( "JOINED-X-PROJECTS", { count: userProjects.length } ),
    };
  }, [observationUuid, remoteObservation, userLogin, userProjects, t] );

  const projects: ApiProject[] = observationUuid
    ? observationProjects
    : ( userProjects ?? [] );

  const isLoading = observationUuid
    ? !remoteObservation
    : userProjectsLoading;

  useEffect( ( ) => {
    if ( headerOptions ) {
      navigation.setOptions( headerOptions );
    }
  }, [headerOptions, navigation] );

  if ( isLoading ) {
    return (
      <ViewWrapper>
        <ActivityIndicator size={50} />
      </ViewWrapper>
    );
  }

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
