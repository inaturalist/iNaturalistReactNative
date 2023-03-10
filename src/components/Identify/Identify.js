// @flow

import { searchObservations } from "api/observations";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import Observation from "realmModels/Observation";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import { viewStyles } from "styles/identify/identify";

import CardSwipeView from "./CardSwipeView";
import GridView from "./GridView";

const Identify = (): Node => {
  const [view, setView] = React.useState( "grid" );

  const searchParams = {
    reviewed: false,
    fields: Observation.FIELDS
  };

  const { data: observations, isLoading } = useAuthenticatedQuery(
    ["searchObservations"],
    optsWithAuth => searchObservations( searchParams, optsWithAuth )
  );

  const setGridView = () => setView( "grid" );
  const setCardView = () => setView( "card" );

  const renderView = () => {
    if ( view === "card" ) {
      return <CardSwipeView observationList={observations} />;
    }
    return (
      <GridView
        loading={isLoading}
        observationList={observations}
        testID="Identify.observationGrid"
      />
    );
  };

  const { t } = useTranslation();

  return (
    <ViewWrapper>
      <View style={viewStyles.toggleViewRow}>
        <Pressable onPress={setCardView} accessibilityRole="button">
          <Text>{t( "Card-View" )}</Text>
        </Pressable>
        <Pressable
          onPress={setGridView}
          testID="ObsList.toggleGridView"
          accessibilityRole="button"
        >
          <Text>{t( "Grid-View" )}</Text>
        </Pressable>
      </View>
      {renderView()}
    </ViewWrapper>
  );
};

export default Identify;
