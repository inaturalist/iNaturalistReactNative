// @flow

import * as React from "react";
import { Text, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { viewStyles, textStyles } from "../../styles/projects/projectDetails";
import useProjectDetails from "./hooks/useProjectDetails";

const ProjectDetails = ( ): React.Node => {
  const { params } = useRoute( );
  const { id } = params;
  console.log( id, "id in project details" );
  const project = useProjectDetails( id );

  return (
    <ViewWithFooter>
      <ScrollView
        contentContainerStyle={viewStyles.scrollView}
        // testID={`ProjectDetails.${id}`}
      >
        <Text>project details</Text>
      </ScrollView>
    </ViewWithFooter>
  );
};

export default ProjectDetails;

