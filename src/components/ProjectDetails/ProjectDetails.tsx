import { useNavigation } from "@react-navigation/native";
import type { ProjectRulePreference } from "api/types";
import { SPECIES_TAB } from "appConstants/tabs";
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
import type { TabStackScreenProps } from "navigation/types";
import React, { useCallback, useState } from "react";
import { Alert } from "react-native";
import Config from "react-native-config";
import { openExternalWebBrowser } from "sharedHelpers/util";
import { useFeatureFlag, useTranslation } from "sharedHooks";
import useNavigateToExplore from "sharedHooks/useNavigateToExplore";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import colors from "styles/tailwindColors";

import formatProjectDate from "../Projects/helpers/displayDates";
import AboutProjectType from "./AboutProjectType";

const defaultProjectIcon = "https://www.inaturalist.org/attachment_defaults/general/span2.png";

const NONE = "NONE";
const JOIN = "JOIN";
const LEAVE = "LEAVE";

const PROJECT_URL = `${Config.OAUTH_API_URL}/projects`;

interface Project {
  current_user_is_member: boolean;
  current_user_observations_count?: number;
  description: string;
  header_image_url: string | null;
  icon: string;
  id: number;
  journal_posts_count?: number;
  membership_model: "inviteonly" | "open" | null;
  members_count?: number;
  observations_count?: number;
  project_type: "collection" | "umbrella" | "";
  rule_preferences: ProjectRulePreference[];
  species_count?: number;
  title: string;
}

interface Props {
  project: Project | null;
  joinProject: ( ) => void;
  leaveProject: ( ) => void;
  loadingProjectMembership: boolean;
}

const ProjectDetails = ( {
  project, joinProject, leaveProject, loadingProjectMembership,
}: Props ) => {
  const newsEnabled = useFeatureFlag( FeatureFlag.NewsEnabled );

  const { t, i18n } = useTranslation( );
  const navigation = useNavigation<TabStackScreenProps<"ProjectDetails">["navigation"]>( );
  const navigateToExplore = useNavigateToExplore( );

  const [openSheet, setOpenSheet] = useState( NONE );

  const onObservationPressed = useCallback(
    ( toMap: boolean ) => {
      navigateToExplore( {
        project,
        layout: toMap
          ? "map"
          : undefined,
      } );
    },
    [navigateToExplore, project],
  );

  const onSpeciesPressed = useCallback(
    ( ) => navigateToExplore( {
      project,
      tab: SPECIES_TAB,
    } ),
    [navigateToExplore, project],
  );

  const onMembersPressed = useCallback(
    ( ) => {
      navigation.navigate( "ProjectMembers", {
        // Function is only rendered with a button after null check below
        id: ( project as Project ).id,
        title: ( project as Project ).title,
      } );
    },
    [navigation, project],
  );

  const onJournalPostsPressed = ( ) => {
    navigation.navigate( "Journal", {
      // Function is only rendered with a button after null check below
      projectIcon: ( project as Project ).icon,
      projectId: ( project as Project ).id,
      projectTitle: ( project as Project ).title,
    } );
  };

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

  const iconClassName = "h-[90px] w-[90px] rounded-full bg-white -top-6";

  const displayProjectIcon = ( icon: string ) => {
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

  const backgroundImageSource = project.header_image_url
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
          {displayProjectIcon( project.icon )}
        </ImageBackground>
      </View>
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
          onObservationPressed={( ) => onObservationPressed( false )}
          onSpeciesPressed={onSpeciesPressed}
          onMembersPressed={onMembersPressed}
          onJournalPostsPressed={onJournalPostsPressed}
          newsEnabled={newsEnabled}
        />
        <Heading4 className="mt-7">{t( "ABOUT" )}</Heading4>
        {project.description && (
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
          onPress={( ) => onObservationPressed( true )}
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
              onPress={( ) => {
                if ( project.membership_model === "inviteonly" ) {
                  Alert.alert( t( "Membership-in-this-project-is-by-invitation-only" ) );
                } else {
                  setOpenSheet( JOIN );
                }
              }}
              loading={loadingProjectMembership}
              disabled={loadingProjectMembership}
            />
          )
          : (
            <Button
              level="neutral"
              text={t( "LEAVE" )}
              onPress={( ) => setOpenSheet( LEAVE )}
              loading={loadingProjectMembership}
              disabled={loadingProjectMembership}
            />
          )}
        <AboutProjectType projectType={project.project_type} />
        <Body4
          className="underline mt-[11px]"
          accessibilityRole="link"
          onPress={async ( ) => openExternalWebBrowser( `${PROJECT_URL}/${project.id}` )}
        >
          {t( "View-in-browser" )}
        </Body4>
      </View>
      {openSheet === JOIN && (
        <WarningSheet
          onPressClose={( ) => setOpenSheet( NONE )}
          confirm={( ) => {
            joinProject( );
            setOpenSheet( NONE );
          }}
          headerText={t( "JOIN-PROJECT--question" )}
          buttonText={t( "JOIN" )}
          handleSecondButtonPress={( ) => setOpenSheet( NONE )}
          secondButtonText={t( "CANCEL" )}
          loading={loadingProjectMembership}
          buttonType="primary"
        />
      )}
      {openSheet === LEAVE && (
        <WarningSheet
          onPressClose={( ) => setOpenSheet( NONE )}
          confirm={( ) => {
            leaveProject( );
            setOpenSheet( NONE );
          }}
          headerText={t( "LEAVE-PROJECT--question" )}
          text={
            project.project_type === ""
            && project.current_user_observations_count > 0
            && t( "If-you-leave-x-of-your-observations-removed", {
              count: project.current_user_observations_count,
            } )
          }
          buttonText={t( "LEAVE" )}
          handleSecondButtonPress={( ) => setOpenSheet( NONE )}
          secondButtonText={t( "CANCEL" )}
          loading={loadingProjectMembership}
        />
      )}
    </ScrollViewWrapper>
  );
};

export default ProjectDetails;
