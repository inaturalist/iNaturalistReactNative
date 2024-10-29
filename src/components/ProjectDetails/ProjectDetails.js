// @flow

import { useNavigation } from "@react-navigation/native";
import displayProjectType from "components/Projects/helpers/displayProjectType.ts";
import {
  Body4,
  Button,
  Heading1,
  Heading4,
  OverviewCounts,
  ScrollViewWrapper,
  Subheading1,
  UserText
} from "components/SharedComponents";
import {
  Image, ImageBackground, View
} from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { openExternalWebBrowser } from "sharedHelpers/util.ts";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import formatProjectDate from "../Projects/helpers/displayDates";
import AboutProjectType from "./AboutProjectType";

const PROJECT_URL = "https://www.inaturalist.org/projects";

type Props = {
  project: Object,
  joinProject: Function,
  leaveProject: Function,
  loadingProjectMembership: boolean
}

const ProjectDetails = ( {
  project, joinProject, leaveProject, loadingProjectMembership
}: Props ): Node => {
  const setExploreView = useStore( state => state.setExploreView );

  const { t, i18n } = useTranslation( );
  const navigation = useNavigation( );

  const onObservationPressed = useCallback(
    ( ) => {
      setExploreView( "observations" );
      navigation.navigate( "Explore", {
        project,
        worldwide: true
      } );
    },
    [navigation, project, setExploreView]
  );

  const onSpeciesPressed = useCallback(
    ( ) => {
      setExploreView( "species" );
      navigation.navigate( "Explore", {
        project,
        worldwide: true
      } );
    },
    [navigation, project, setExploreView]
  );

  const onMembersPressed = useCallback(
    ( ) => {
      navigation.navigate( "ProjectMembers", {
        id: project?.id,
        title: project?.title
      } );
    },
    [navigation, project]
  );

  if ( !project ) {
    return null;
  }

  const userTextStyle = { lineHeight: 26 };

  const { projectDate, shouldDisplayDateRange } = formatProjectDate( project, t, i18n );

  return (
    <ScrollViewWrapper testID="project-details">
      <View className="h-[24px]" />
      <ImageBackground
        className="h-[164px] w-full items-center bg-darkGray"
        source={{ uri: project.header_image_url }}
        testID="ProjectDetails.headerImage"
      >
        <Image
          source={{ uri: project.icon }}
          className="h-[70px] w-[70px] rounded-full bottom-6 z-100"
          testID="ProjectDetails.projectIcon"
          accessibilityIgnoresInvertColors
        />
      </ImageBackground>
      <View className="mx-4 pb-8">
        <Heading1 className="shrink mt-4">{project.title}</Heading1>
        <Subheading1>
          {shouldDisplayDateRange
            ? projectDate
            : displayProjectType( project.project_type, t )}
        </Subheading1>
        <OverviewCounts
          counts={{
            observations_count: project.observations_count,
            species_count: project.species_count,
            members_count: project.members_count,
            journal_posts_count: project.journal_posts_count
          }}
          onObservationPressed={onObservationPressed}
          onSpeciesPressed={onSpeciesPressed}
          onMembersPressed={onMembersPressed}
        />
        <Heading4 className="mt-7">{t( "ABOUT" )}</Heading4>
        {project?.description
          && <UserText text={project.description} htmlStyle={userTextStyle} />}
        {project.project_type === "collection" && (
          <>
            <Heading4 className="mb-3 mt-5">{t( "PROJECT-REQUIREMENTS" )}</Heading4>
            <Button
              className="mb-5"
              level="neutral"
              text={t( "VIEW-PROJECT-REQUIREMENTS" )}
              onPress={( ) => navigation.navigate( "ProjectRequirements", { id: project.id } )}
            />
          </>
        )}
        <Heading4 className="mb-3">{t( "MAP" )}</Heading4>
        <Button
          level="neutral"
          text={t( "VIEW-IN-EXPLORE" )}
          onPress={onObservationPressed}
        />
        {!project.project_type && (
          <>
            <Heading4 className="mb-3 mt-5">
              {
                !project.current_user_is_member
                  ? t( "JOIN-PROJECT" )
                  : t( "LEAVE-PROJECT" )
              }
            </Heading4>
            {!project.current_user_is_member
              ? (
                <Button
                  level="neutral"
                  text={t( "JOIN" )}
                  onPress={joinProject}
                  loading={loadingProjectMembership}
                />
              )
              : (
                <Button
                  level="neutral"
                  text={t( "LEAVE" )}
                  onPress={leaveProject}
                  loading={loadingProjectMembership}
                />
              )}
          </>
        )}
        <AboutProjectType projectType={project.project_type} />
        <Body4
          className="underline mt-[11px]"
          onPress={async () => openExternalWebBrowser( `${PROJECT_URL}/${project.id}` )}
        >
          {t( "View-in-browser" )}
        </Body4>
      </View>
    </ScrollViewWrapper>
  );
};

export default ProjectDetails;
