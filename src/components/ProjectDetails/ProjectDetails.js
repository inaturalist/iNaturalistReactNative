// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import displayProjectType from "components/Projects/helpers/displayProjectType";
import {
  Body4,
  Button,
  Heading1,
  Heading4,
  INatIcon,
  OverviewCounts,
  ScrollViewWrapper,
  Subheading1,
  UserText,
  WarningSheet,
} from "components/SharedComponents";
import {
  Image, ImageBackground, View,
} from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import Config from "react-native-config";
import { openExternalWebBrowser } from "sharedHelpers/util";
import { useStoredLayout, useTranslation } from "sharedHooks";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

import formatProjectDate from "../Projects/helpers/displayDates";
import AboutProjectType from "./AboutProjectType";

const defaultProjectIcon = "https://www.inaturalist.org/attachment_defaults/general/span2.png";

const NONE = "NONE";
const JOIN = "JOIN";
const LEAVE = "LEAVE";

const PROJECT_URL = `${Config.OAUTH_API_URL}/projects`;

type Props = {
  project: Object,
  joinProject: Function,
  leaveProject: Function,
  loadingProjectMembership: boolean
}

const ProjectDetails = ( {
  project, joinProject, leaveProject, loadingProjectMembership,
}: Props ): Node => {
  const setExploreView = useStore( state => state.setExploreView );

  const { t, i18n } = useTranslation( );
  const navigation = useNavigation( );

  const { writeLayoutToStorage } = useStoredLayout( "exploreObservationsLayout" );

  const [openSheet, setOpenSheet] = useState( NONE );

  const onObservationPressed = useCallback(
    ( toMap: boolean ) => {
      setExploreView( "observations" );
      if ( toMap ) {
        writeLayoutToStorage( "map" );
      }
      navigation.navigate( "Explore", {
        project,
        // If selected project has no place_id, show map in worldwide mode
        worldwide: !project?.place,
        place: project?.place,
      } );
    },
    [navigation, project, setExploreView, writeLayoutToStorage],
  );

  const onSpeciesPressed = useCallback(
    ( ) => {
      setExploreView( "species" );
      navigation.navigate( "Explore", {
        project,
        worldwide: true,
      } );
    },
    [navigation, project, setExploreView],
  );

  const onMembersPressed = useCallback(
    ( ) => {
      navigation.navigate( "ProjectMembers", {
        id: project?.id,
        title: project?.title,
      } );
    },
    [navigation, project],
  );

  if ( !project ) {
    return null;
  }

  const userTextStyle = { lineHeight: 26 };

  const { projectDate, shouldDisplayDateRange } = formatProjectDate( project, t, i18n );

  const displayBriefcase = ( ) => (
    <INatIcon
      name="briefcase"
      size={66}
      color={colors.darkGray}
    />
  );

  const iconClassName = "h-[134px] w-[134px] rounded-full bg-white -top-6";

  const displayProjectIcon = icon => {
    const productionIcon = icon?.replace( "staticdev", "static" );

    if ( productionIcon === defaultProjectIcon ) {
      return (
        <View className={
          classnames(
            iconClassName,
            "justify-center items-center",
          )
        }
        >
          {displayBriefcase( )}
        </View>
      );
    }
    return (
      <Image
        source={{ uri: productionIcon }}
        className={iconClassName}
        testID="ProjectDetails.projectIcon"
        accessibilityIgnoresInvertColors
      />
    );
  };

  const backgroundImageSource = project?.header_image_url
    ? { uri: project.header_image_url }
    : require( "images/background/project_banner.jpg" );

  return (
    <ScrollViewWrapper testID="project-details">
      <View className="pt-[24px]">
        <ImageBackground
          className="h-[164px] w-full items-center bg-darkGray"
          source={backgroundImageSource}
          testID="ProjectDetails.headerImage"
          accessibilityIgnoresInvertColors
        >
          {displayProjectIcon( project?.icon )}
        </ImageBackground>
      </View>

      {/* <Image
          source={{ uri: project.icon }}
          className="h-[70px] w-[70px] rounded-full bottom-6 z-100 bg-white"
          testID="ProjectDetails.projectIcon"
          accessibilityIgnoresInvertColors
        /> */}
      {/* </ImageBackground> */}
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
            journal_posts_count: project.journal_posts_count,
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
              disabled={loadingProjectMembership}
            />
          )
          : (
            <Button
              level="neutral"
              text={t( "LEAVE" )}
              onPress={() => setOpenSheet( LEAVE )}
              loading={loadingProjectMembership}
              disabled={loadingProjectMembership}
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
          text={
            project.project_type === ""
            && project?.current_user_observations_count > 0
            && t( "If-you-leave-x-of-your-observations-removed", {
              count: project?.current_user_observations_count,
            } )
          }
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
