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
  UserText,
  WarningSheet
} from "components/SharedComponents";
import {
  Image, ImageBackground, View
} from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import { openExternalWebBrowser } from "sharedHelpers/util.ts";
import { useStoredLayout, useTranslation } from "sharedHooks";
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

  const { writeLayoutToStorage } = useStoredLayout( "exploreObservationsLayout" );

  const NONE = "NONE";
  const JOIN = "JOIN";
  const LEAVE = "LEAVE";
  const [openSheet, setOpenSheet] = useState( NONE );

  const onObservationPressed = useCallback(
    ( toMap: boolean ) => {
      setExploreView( "observations" );
      if ( toMap ) {
        writeLayoutToStorage( "map" );
      }
      navigation.navigate( "Explore", {
        project,
        worldwide: true
      } );
    },
    [navigation, project, setExploreView, writeLayoutToStorage]
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
          onObservationPressed={() => onObservationPressed( false )}
          onSpeciesPressed={onSpeciesPressed}
          onMembersPressed={onMembersPressed}
        />
        <Heading4 className="mt-7">{t( "ABOUT" )}</Heading4>
        {project?.description && (
          <UserText text={project.description} htmlStyle={userTextStyle} />
        )}
        {project.project_type === "collection" && (
          <>
            <Heading4 className="mb-3 mt-5">
              {t( "PROJECT-REQUIREMENTS" )}
            </Heading4>
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
          onPress={() => onObservationPressed( true )}
        />
        <Heading4 className="mb-3 mt-5">
          {!project.current_user_is_member
            ? t( "JOIN-PROJECT" )
            : t( "LEAVE-PROJECT" )}
        </Heading4>
        {!project.current_user_is_member
          ? (
            <Button
              level="neutral"
              text={t( "JOIN" )}
              onPress={() => setOpenSheet( JOIN )}
              loading={loadingProjectMembership}
            />
          )
          : (
            <Button
              level="neutral"
              text={t( "LEAVE" )}
              onPress={() => setOpenSheet( LEAVE )}
              loading={loadingProjectMembership}
            />
          )}
        <AboutProjectType projectType={project.project_type} />
        <Body4
          className="underline mt-[11px]"
          accessibilityRole="link"
          onPress={async () => openExternalWebBrowser( `${PROJECT_URL}/${project.id}` )}
        >
          {t( "View-in-browser" )}
        </Body4>
      </View>
      {openSheet === JOIN && (
        <WarningSheet
          onPressClose={() => setOpenSheet( NONE )}
          confirm={() => {
            joinProject();
            setOpenSheet( NONE );
          }}
          headerText={t( "JOIN-PROJECT--question" )}
          buttonText={t( "JOIN" )}
          handleSecondButtonPress={() => setOpenSheet( NONE )}
          secondButtonText={t( "CANCEL" )}
          loading={loadingProjectMembership}
          buttonType="primary"
        />
      )}
      {openSheet === LEAVE && (
        <WarningSheet
          onPressClose={() => setOpenSheet( NONE )}
          confirm={() => {
            leaveProject();
            setOpenSheet( NONE );
          }}
          headerText={t( "LEAVE-PROJECT--question" )}
          buttonText={t( "LEAVE" )}
          handleSecondButtonPress={() => setOpenSheet( NONE )}
          secondButtonText={t( "CANCEL" )}
          loading={loadingProjectMembership}
        />
      )}
    </ScrollViewWrapper>
  );
};

export default ProjectDetails;
