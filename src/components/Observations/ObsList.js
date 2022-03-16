// @flow

import React, { useContext } from "react";
import type { Node } from "react";
import { Pressable, Text } from "react-native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ObservationContext } from "../../providers/contexts";
import ObservationViews from "../SharedComponents/ObservationViews/ObservationViews";

const ObsList = ( ): Node => {
  const { observationList, loading, syncObservations } = useContext( ObservationContext );

  return (
    <ViewWithFooter>
      <Pressable onPress={syncObservations}>
        <Text>sync</Text>
      </Pressable>
      <ObservationViews
        loading={loading}
        observationList={observationList}
        testID="ObsList.myObservations"
      />
    </ViewWithFooter>
  );
};

export default ObsList;
