// @flow

import React, { useContext, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";

import useFetchObservations from "./hooks/fetchObservations";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ObservationContext } from "../../providers/contexts";
import ObservationViews from "../SharedComponents/ObservationViews/ObservationViews";

const ObsList = ( ): Node => {
  const { observationList, fetchObservations } = useContext( ObservationContext );
  const navigation = useNavigation( );

  // this custom hook fetches on first component render
  // (and anytime you save while in debug - hot reloading mode )
  // this will eventually go in a sync button / pull-from-top gesture
  // instead of automatically fetching every time the component loads
  const loading = useFetchObservations( );

  useEffect( ( ) => {
    // addListener is here to make sure the collection from realm is the most recent, valid
    // collection, even after a user taps into obs detail and then comes back to
    // the observation list screen. otherwise, realm results will error as invalidated objects
    const unsub = navigation.addListener( "focus", ( ) => {
      fetchObservations( );
    } );

    return unsub;
  } );

  return (
    <ViewWithFooter>
      <ObservationViews
        loading={loading}
        observationList={observationList}
        testID="ObsList.myObservations"
      />
    </ViewWithFooter>
  );
};

export default ObsList;
