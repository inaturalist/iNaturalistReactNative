// @flow

import { useNavigation } from "@react-navigation/native";
import displayProjectType from "components/Projects/helpers/displayProjectType";
import {
  Button, Heading1, Heading3, Heading4, ScrollViewWrapper,
  UserText
} from "components/SharedComponents";
import OverviewCounts from "components/SharedComponents/OverviewCounts";
import {
  Image, ImageBackground, View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  project: Object
}

const ProjectDetails = ( { project }: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );

  if ( !project ) {
    return null;
  }

  return (
    <ScrollViewWrapper testID="project-details">
      <View className="h-[24px]" />
      <ImageBackground
        className="h-[164px] w-full items-center bg-darkGray"
        source={{ uri: project.header_image_url }}
        testID="ProjectDetails.headerImage"
      >
        {/* {console.log( project, "project" )} */}
        <Image
          source={{ uri: project.icon }}
          className="h-[70px] w-[70px] rounded-full bottom-6 z-100"
          testID="ProjectDetails.projectIcon"
          accessibilityIgnoresInvertColors
        />
      </ImageBackground>
      <View className="mx-4">
        <Heading1 className="shrink mt-4">{project.title}</Heading1>
        <Heading3>{displayProjectType( project.project_type, t )}</Heading3>
        <OverviewCounts
          counts={{
            observations_count: project.observations_count,
            species_count: project.species_count,
            members_count: project.members_count,
            journal_posts_count: project.journal_posts_count
          }}
        />
        <Heading4 className="mb-3 mt-5">{t( "ABOUT" )}</Heading4>
        {/* eslint-disable-next-line react-native/no-inline-styles */}
        <UserText text={project.description} htmlStyle={{ lineHeight: 26 }} />
        <Heading4 className="mb-3 mt-5">{t( "PROJECT-REQUIREMENTS" )}</Heading4>
        <Button
          level="neutral"
          text={t( "VIEW-PROJECT-REQUIREMENTS" )}
        />
        <Heading4 className="mb-3 mt-5">{t( "MAP" )}</Heading4>
        <Button
          level="neutral"
          text={t( "VIEW-IN-EXPLORE" )}
          onPress={( ) => navigation.navigate( "Explore", {
            projectId: project.id,
            placeId: project.place_id
          } )}
        />
      </View>
    </ScrollViewWrapper>
  );
};

export default ProjectDetails;
