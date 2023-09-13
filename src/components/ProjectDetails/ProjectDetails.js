// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Body2, Button,
  Heading1, Heading3, Heading4, ScrollViewWrapper
} from "components/SharedComponents";
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

  const displayProjectType = ( ) => {
    if ( project.project_type === "collection" ) {
      return t( "Collection-Project" );
    }
    if ( project.project_type === "umbrella" ) {
      return t( "Umbrella-Project" );
    }
    return t( "Traditional-Project" );
  };

  return (
    <ScrollViewWrapper testID="project-details">
      <View className="h-[24px]" />
      <ImageBackground
        className="h-[164px] w-full items-center bg-darkGray"
        source={{ uri: project.header_image_url }}
        testID="ProjectDetails.headerImage"
      >
        {console.log( project, "project" )}
        <Image
          source={{ uri: project.icon }}
          className="h-[70px] w-[70px] rounded-full bottom-6 z-100"
          testID="ProjectDetails.projectIcon"
          accessibilityIgnoresInvertColors
        />
      </ImageBackground>
      <View className="mx-4">
        <Heading1 className="shrink mt-4">{project.title}</Heading1>
        <Heading3>{displayProjectType( )}</Heading3>
        <Heading4 className="mb-3 mt-5">{t( "ABOUT" )}</Heading4>
        <Body2>{project.description}</Body2>
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
