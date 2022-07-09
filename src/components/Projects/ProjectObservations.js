// @flow

import * as React from "react";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";

import useProjectObservations from "./hooks/useProjectObservations";
import GridItem from "../SharedComponents/ObservationViews/GridItem";

type Props = {
  id: number
}

const ProjectObservations = ( { id }: Props ): React.Node => {
  const observations = useProjectObservations( id );
  const navigation = useNavigation( );
  const navToObsDetails = observation => {
    navigation.navigate( "ObsDetails", { uuid: observation.uuid } );
  };

  const renderGridItem = ( { item } ) => (
    <GridItem item={item} handlePress={navToObsDetails} uri="project" />
  );
  return (
    <FlatList
      data={observations}
      key={1}
      renderItem={renderGridItem}
      numColumns={4}
      testID="ProjectObservations.grid"
    />
  );
};

export default ProjectObservations;
