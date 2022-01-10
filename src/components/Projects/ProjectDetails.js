// @flow

import * as React from "react";
import { Text } from "react-native";
import { useRoute } from "@react-navigation/native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { viewStyles, textStyles } from "../../styles/projects/projectDetails";
import useProjectDetails from "./hooks/useProjectDetails";
import { ScrollView } from "react-native-gesture-handler";

const TaxonDetails = ( ): React.Node => {
  const { params } = useRoute( );
  const { id } = params;
  console.log( id, "id in project details" );
  const project = useProjectDetails( id );
  // const similarSpecies = useSimilarSpecies( id );

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

export default TaxonDetails;

