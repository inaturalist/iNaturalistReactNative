// @flow

import { useNavigation } from "@react-navigation/native";
import { searchObservations } from "api/observations";
import ObsGridItem from "components/Observations/ObsGridItem";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { FlatList } from "react-native";
import { Pressable } from "components/styledComponents";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

type Props = {
  id: number
}

const ProjectObservations = ( { id }: Props ): React.Node => {
  const { t } = useTranslation();
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
    <Pressable
      className="w-6/12"
      onPress={() => navToObsDetails( item )}
      accessibilityRole="link"
      accessibilityHint={t( "Navigate-to-observation-details" )}
      accessibilityLabel={t( "Observation-details", {
        scientificName: item.name
      } )}
    >
      <ObsGridItem
        observation={item}
        isProject
      />
    </Pressable>
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
