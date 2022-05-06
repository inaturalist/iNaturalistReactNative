// @flow

import React, { useContext, useEffect } from "react";
import type { Node } from "react";
import { Pressable, Text } from "react-native";
import { useRoute } from "@react-navigation/native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ObservationContext } from "../../providers/contexts";
import ObservationViews from "../SharedComponents/ObservationViews/ObservationViews";
import UserCard from "./UserCard";
import { useCurrentUser } from "./hooks/useCurrentUser";

const ObsList = ( ): Node => {
  const { params } = useRoute( );
  const { observationList, loading, syncObservations, fetchNextObservations } = useContext( ObservationContext );

  const id = params && params.userId;

  useEffect( ( ) => {
    // start fetching data immediately after successful login
    if ( params && params.syncData ) {
      syncObservations( params.userLogin );
    }
  }, [params, syncObservations] );

  const userId = useCurrentUser( );

  return (
    <ViewWithFooter>
      <UserCard userId={userId || id} />
      <Pressable onPress={syncObservations}>
        <Text>sync</Text>
      </Pressable>
      <ObservationViews
        loading={loading}
        observationList={observationList}
        testID="ObsList.myObservations"
        handleEndReached={fetchNextObservations}
      />
    </ViewWithFooter>
  );
};

export default ObsList;
