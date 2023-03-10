// @flow

import { useRoute } from "@react-navigation/native";
import { fetchProjects } from "api/projects";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import * as React from "react";
import { Image, ImageBackground, Text } from "react-native";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import { imageStyles, textStyles } from "styles/projects/projectDetails";

import ProjectObservations from "./ProjectObservations";

const ProjectDetails = (): React.Node => {
  const { params } = useRoute();
  const { id } = params;

  const { data: project } = useAuthenticatedQuery(
    ["fetchProjects", id],
    optsWithAuth => fetchProjects( id, {}, optsWithAuth )
  );

  if ( !project ) {
    return null;
  }

  return (
    <ViewWrapper testID="project-details">
      <ImageBackground
        source={{ uri: project.header_image_url }}
        // $FlowFixMe
        style={imageStyles.headerImage}
        testID="ProjectDetails.headerImage"
      >
        <Image
          source={{ uri: project.icon }}
          style={imageStyles.icon}
          testID="ProjectDetails.projectIcon"
        />
      </ImageBackground>
      <Text style={textStyles.descriptionText}>{project.title}</Text>
      <Text style={textStyles.descriptionText}>{project.description}</Text>
      {/* TODO: support joining or leaving projects once oauth is set up */}
      <ProjectObservations id={id} />
    </ViewWrapper>
  );
};

export default ProjectDetails;
