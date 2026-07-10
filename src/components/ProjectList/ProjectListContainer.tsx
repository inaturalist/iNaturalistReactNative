import { useNavigation, useRoute } from "@react-navigation/native";
import { PROJECT_SUMMARY_FIELDS, PROJECT_SUMMARY_POF_FIELDS } from "api/fields";
import type { ApiProjectSummary, ApiProjectSummaryWithPOF, ApiResponse } from "api/types";
import { fetchUserProjects } from "api/users";
import {
  ActivityIndicator,
  Body1,
} from "components/SharedComponents";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import type { TabStackScreenProps } from "navigation/types";
import { RealmContext } from "providers/contexts";
import React, { useEffect, useMemo } from "react";
import Project from "realmModels/Project";
import {
  useAuthenticatedQuery,
  useCurrentUser,
  useRemoteObservation,
  useTranslation,
} from "sharedHooks";

import ProjectList from "./ProjectList";

const { useRealm } = RealmContext;

const ProjectListContainer = ( ) => {
  const realm = useRealm( );
  const navigation = useNavigation<TabStackScreenProps<"ProjectList">["navigation"]>( );
  const { params } = useRoute<TabStackScreenProps<"ProjectList">["route"]>( );
  const { observationUuid, userId, userLogin } = params;
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );

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

  const isCurrentUser = userId === currentUser?.id;
  const fields = isCurrentUser
    ? PROJECT_SUMMARY_POF_FIELDS
    : PROJECT_SUMMARY_FIELDS;
  const {
    data,
    isLoading: userProjectsLoading,
  } = useAuthenticatedQuery<ApiResponse<ApiProjectSummary | ApiProjectSummaryWithPOF>>(
    ["fetchUserProjects", userId, fields],
    optsWithAuth => fetchUserProjects(
      {
        id: userId,
        per_page: 200,
        fields,
      },
      optsWithAuth,
    ),
    { enabled: !!userId },
  );

  const { results: userProjects } = data || {};

  // Update local copy of the current user's joined projects
  useEffect( () => {
    if ( isCurrentUser ) {
      Project.upsertRemoteProjects( userProjects as ApiProjectSummaryWithPOF[], realm );
    }
  }, [isCurrentUser, userProjects, realm] );

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

  const projects: ApiProjectSummary[] = observationUuid
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
      <ScreenShell>
        <ActivityIndicator size={50} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
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
    </ScreenShell>
  );
};

export default ProjectListContainer;
