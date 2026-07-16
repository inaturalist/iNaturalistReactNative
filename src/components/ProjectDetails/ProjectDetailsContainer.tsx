import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import {
  PROJECT_DETAIL_FIELDS,
} from "api/fields";
import { fetchSpeciesCounts, searchObservations } from "api/observations";
import fetchPlace from "api/places";
import {
  fetchMembership,
  fetchProjectPostsCount,
  fetchProjects,
  joinProject,
  leaveProject,
} from "api/projects";
import type {
  ApiObservationsSearchResponse, ApiPlace, ApiProject, ApiResponse,
} from "api/types";
import type { TabStackScreenProps } from "navigation/types";
import { RealmContext } from "providers/contexts";
import React, { useMemo, useState } from "react";
import Project from "realmModels/Project";
import { log } from "sharedHelpers/logger";
import { useAuthenticatedMutation, useAuthenticatedQuery, useCurrentUser } from "sharedHooks";

import ProjectDetails from "./ProjectDetails";

const logger = log.extend( "ProjectDetailsContainer" );
const { useRealm } = RealmContext;

const ProjectDetailsContainer = ( ) => {
  const navigation = useNavigation<TabStackScreenProps<"ProjectDetails">["navigation"]>( );
  const { params } = useRoute<TabStackScreenProps<"ProjectDetails">["route"]>( );
  const { id } = params;
  const realm = useRealm( );
  const currentUser = useCurrentUser( );
  const [loading, setLoading] = useState( false );

  const fetchProjectsQueryKey = ["projectDetails", "fetchProjects", id];

  const { data: project } = useAuthenticatedQuery<ApiProject>(
    fetchProjectsQueryKey,
    optsWithAuth => fetchProjects( id, {
      fields: PROJECT_DETAIL_FIELDS,
    }, optsWithAuth ),
  );

  const fetchProjectPlaceQueryKey = ["projectPlace", "fetchPlace", project?.place_id];

  const { data: projectPlace } = useAuthenticatedQuery<ApiPlace>(
    fetchProjectPlaceQueryKey,
    optsWithAuth => fetchPlace( project?.place_id, {
      fields: "all",
    }, optsWithAuth ),
  );

  const { data: projectPosts } = useAuthenticatedQuery<number>(
    ["fetchProjectPostsCount", id],
    optsWithAuth => fetchProjectPostsCount( {
      id,
    }, optsWithAuth ),
  );

  const { data: projectStats } = useAuthenticatedQuery<ApiObservationsSearchResponse>(
    ["searchObservations", "projectStats", id],
    ( ) => searchObservations( {
      project_id: id,
      per_page: 0,
    } ),
  );

  const { data: usersObservations } = useAuthenticatedQuery<ApiObservationsSearchResponse>(
    ["searchObservationsByUserInProject", id],
    optsWithAuth => searchObservations(
      {
        project_id: id,
        user_id: currentUser?.id,
        per_page: 0,
      },
      optsWithAuth,
    ),
    {
      enabled: !!currentUser,
    },
  );

  const { data: speciesCounts } = useAuthenticatedQuery<ApiResponse<object>>(
    ["fetchSpeciesCounts", id],
    ( ) => fetchSpeciesCounts( {
      project_id: id,
      per_page: 0,
    } ),
  );

  const membershipQueryKey = ["fetchMembership", id];
  const { data: currentMembership } = useAuthenticatedQuery<number>(
    membershipQueryKey,
    optsWithAuth => fetchMembership( {
      id,
    }, optsWithAuth ),
    {
      enabled: !!( currentUser ),
    },
  );

  const queryClient = useQueryClient( );

  const { mutate: joinProjectMutate } = useAuthenticatedMutation(
    ( _, optsWithAuth ) => joinProject( { id }, optsWithAuth ),
    {
      onSuccess: ( ) => {
        // project is not undefined here because we call the mutation in the child
        // which has a !project check before rendering the buttons that call here
        Project.upsertRemoteProjects( [project as ApiProject], realm );
        queryClient.invalidateQueries( membershipQueryKey );
      },
      onError: error => {
        // project is not undefined here because we call the mutation in the child
        // which has a !project check before rendering the buttons that call here
        logger.error( "could not join project: ", ( project as ApiProject ).id, error );
      },
      onSettled: ( ) => setLoading( false ),
    },
  );

  const { mutate: leaveProjectMutate } = useAuthenticatedMutation(
    ( _, optsWithAuth ) => leaveProject( { id }, optsWithAuth ),
    {
      onSuccess: ( ) => {
        queryClient.invalidateQueries( membershipQueryKey );
      },
      onError: error => {
        // project is not undefined here because we call the mutation in the child
        // which has a !project check before rendering the buttons that call here
        logger.error( "could not leave project: ", ( project as ApiProject ).id, error );
      },
      onSettled: ( ) => setLoading( false ),
    },
  );

  const handleJoinProjectPress = ( ) => {
    if ( currentUser ) {
      setLoading( true );
      joinProjectMutate( );
    } else {
      navigation.navigate( "LoginStackNavigator", {
        screen: "Login",
        params: {
          prevScreen: "ProjectDetails",
          // project is not undefined here because we call the mutation in the child
          // which has a !project check before rendering the buttons that call here
          projectId: ( project as ApiProject ).id,
        },
      } );
    }
  };

  const enrichedProject = useMemo( ( ) => {
    if ( !project ) return null;

    return {
      description: project.description,
      header_image_url: project.header_image_url,
      icon: project.icon,
      id: project.id,
      membership_model: project.membership_model,
      project_type: project.project_type,
      rule_preferences: project.rule_preferences,
      title: project.title,
      members_count: project.user_ids.length,
      journal_posts_count: projectPosts,
      observations_count: projectStats?.total_results,
      species_count: speciesCounts?.total_results,
      current_user_is_member: currentMembership === 1,
      current_user_observations_count: usersObservations?.total_results,
      place: projectPlace,
    };
  }, [
    project,
    projectPosts,
    projectStats?.total_results,
    speciesCounts?.total_results,
    currentMembership,
    usersObservations?.total_results,
    projectPlace,
  ] );

  return (
    <ProjectDetails
      project={enrichedProject}
      joinProject={handleJoinProjectPress}
      leaveProject={( ) => {
        setLoading( true );
        leaveProjectMutate( );
      }}
      loadingProjectMembership={loading}
    />
  );
};

export default ProjectDetailsContainer;
