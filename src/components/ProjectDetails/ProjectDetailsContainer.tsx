import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import {
  PROJECT_DETAIL_FIELDS,
} from "api/fields";
import { fetchSpeciesCounts, searchObservations } from "api/observations";
import {
  fetchProjectPostsCount,
  fetchProjects,
  joinProject,
  leaveProject,
} from "api/projects";
import fetchProjectMembership from "api/projectsTyped";
import { updateProjectUser } from "api/projectUsers";
import type {
  ApiObservationsSearchResponse, ApiProject, ApiResponse,
} from "api/types";
import type { TabStackScreenProps } from "navigation/types";
import { RealmContext } from "providers/contexts";
import React, { useMemo, useState } from "react";
import Project from "realmModels/Project";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useAuthenticatedMutation, useAuthenticatedQuery, useCurrentUser } from "sharedHooks";

import ProjectDetails from "./ProjectDetails";
import type { COORDINATE_ACCESS } from "./Sheets/CoordinateAccessSheet";
import type { LEAVE_KEEP } from "./Sheets/LeaveSheet";

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
      ttl: -1,
    }, optsWithAuth ),
  );

  const { data: projectPosts } = useAuthenticatedQuery<number>(
    ["fetchProjectPostsCount", id],
    optsWithAuth => fetchProjectPostsCount( {
      id,
    }, optsWithAuth ),
  );

  const projectStatsQueryKey = ["searchObservations", "projectStats", id];
  const { data: projectStats } = useAuthenticatedQuery<ApiObservationsSearchResponse>(
    projectStatsQueryKey,
    ( ) => searchObservations( {
      project_id: id,
      per_page: 0,
      ttl: -1,
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

  const speciesCountsQueryKey = ["fetchSpeciesCounts", id];
  const { data: speciesCounts } = useAuthenticatedQuery<ApiResponse<object>>(
    speciesCountsQueryKey,
    ( ) => fetchSpeciesCounts( {
      project_id: id,
      per_page: 0,
      ttl: -1,
    } ),
  );

  const membershipQueryKey = ["fetchProjectMembership", id];
  const { data: currentMembership } = useAuthenticatedQuery(
    membershipQueryKey,
    optsWithAuth => fetchProjectMembership( {
      id,
      ttl: -1,
    }, optsWithAuth ),
    {
      enabled: !!( currentUser ),
    },
  );

  const queryClient = useQueryClient( );

  const { mutate: joinProjectMutate } = useAuthenticatedMutation(
    ( mutationParams, optsWithAuth ) => joinProject( { id, ...mutationParams }, optsWithAuth ),
    {
      onSuccess: ( ) => {
        // project is not undefined here because we call the mutation in the child
        // which has a !project check before rendering the buttons that call here
        Project.upsertRemoteProjects( [project as ApiProject], realm );
        queryClient.invalidateQueries( { queryKey: membershipQueryKey } );
        queryClient.invalidateQueries( { queryKey: fetchProjectsQueryKey } );
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
    ( mutationParams, optsWithAuth ) => leaveProject( { id, ...mutationParams }, optsWithAuth ),
    {
      onSuccess: ( ) => {
        const joinedProject = realm.objectForPrimaryKey( "Project", id );
        if ( joinedProject ) {
          safeRealmWrite( realm, ( ) => {
            realm.delete( joinedProject );
          }, "removing project from realm after leave" );
        }
        queryClient.invalidateQueries( { queryKey: membershipQueryKey } );
        queryClient.invalidateQueries( { queryKey: fetchProjectsQueryKey } );
        queryClient.invalidateQueries( { queryKey: projectStatsQueryKey } );
        queryClient.invalidateQueries( { queryKey: speciesCountsQueryKey } );
      },
      onError: error => {
        // project is not undefined here because we call the mutation in the child
        // which has a !project check before rendering the buttons that call here
        logger.error( "could not leave project: ", ( project as ApiProject ).id, error );
      },
      onSettled: ( ) => setLoading( false ),
    },
  );

  const handleLeaveProjectPress = ( keep?: LEAVE_KEEP ) => {
    setLoading( true );
    const mutationParams = keep
      ? { keep }
      : { };
    leaveProjectMutate( mutationParams );
  };

  const { mutate: updateCoordinateAccessMutate } = useAuthenticatedMutation(
    ( mutationParams, optsWithAuth ) => updateProjectUser( mutationParams, optsWithAuth ),
    {
      onError: error => {
        logger.error(
          "could not update project user coordinate access: ",
          ( project as ApiProject ).id,
          error,
        );
      },
      onSettled: ( ) => setLoading( false ),
    },
  );

  const handleJoinProjectPress = ( access?: COORDINATE_ACCESS ) => {
    if ( currentUser ) {
      setLoading( true );
      const mutationParams = access
        ? { project_user: { preferred_curator_coordinate_access: access } }
        : { };
      joinProjectMutate( mutationParams );
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

  const handleUpdateCoordinateAccess = ( access: COORDINATE_ACCESS ) => {
    if ( !currentMembership ) {
      return;
    }
    const currentMembershipID = currentMembership.results[0].id;
    console.log( "currentMembershipID", currentMembershipID );
    setLoading( true );
    updateCoordinateAccessMutate( {
      id: currentMembershipID,
      project_user: { preferred_curator_coordinate_access: access },
    } );
  };

  const enrichedProject = useMemo( ( ) => {
    if ( !project ) return null;

    return {
      admins: project.admins,
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
      current_user_is_member: !!currentMembership,
      current_user_observations_count: usersObservations?.total_results,
    };
  }, [
    project,
    projectPosts,
    projectStats?.total_results,
    speciesCounts?.total_results,
    currentMembership,
    usersObservations?.total_results,
  ] );

  return (
    <ProjectDetails
      project={enrichedProject}
      joinProject={handleJoinProjectPress}
      leaveProject={handleLeaveProjectPress}
      loadingProjectMembership={loading}
      updateCoordinateAccess={handleUpdateCoordinateAccess}
    />
  );
};

export default ProjectDetailsContainer;
