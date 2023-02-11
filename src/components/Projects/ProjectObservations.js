// @flow

import { useNavigation } from "@react-navigation/native";
import { searchObservations } from "api/observations";
import ObsGridItem from "components/Observations/ObsGridItem";
import * as React from "react";
import { FlatList } from "react-native";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

type Props = {
  id: number
}

const ProjectObservations = ( { id }: Props ): React.Node => {
  const {
    data: observations
  } = useAuthenticatedQuery(
    ["searchObservations", id],
    optsWithAuth => searchObservations( { project_id: id }, optsWithAuth )
  );

  const navigation = useNavigation( );
  const navToObsDetails = observation => {
    navigation.navigate( "ObsDetails", { uuid: observation.uuid } );
  };

  const renderGridItem = ( { item } ) => (
    <ObsGridItem
      observation={item}
      onPress={navToObsDetails}
      uri="project"
      width="w-6/12"
    />
  );

  return (
    <FlatList
      testID="ProjectObservations.grid"
      data={observations}
      key={1}
      renderItem={renderGridItem}
      numColumns={4}
    />
  );
};

export default ProjectObservations;
