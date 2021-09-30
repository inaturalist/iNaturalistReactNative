// @flow strict-local

import React from "react";
import { FlatList } from "react-native";
import type { Node } from "react";

import ObsCard from "./ObsCard";
import viewStyles from "../../styles/observations/observationsList";
import useFetchObservations from "../hooks/fetchObservations";

const ObservationsList = ( ): Node => {
  const observations = useFetchObservations( );

  const extractKey = item => item.uuid;
  const renderItem = ( { item } ) => <ObsCard item={item} />;

  return (
    <FlatList
      contentContainerStyle={viewStyles.background}
      data={observations}
      keyExtractor={extractKey}
      renderItem={renderItem}
    />
  );
};

export default ObservationsList;
