// @flow

import type { Node } from "react";
import React from "react";
import { Pressable, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import colors from "../../../styles/colors";
import { viewStyles } from "../../../styles/observations/obsList";

type Props = {
  isExplore: boolean,
  isLoggedIn: ?boolean,
  syncObservations: Function,
  setView: Function,
  numOfUnuploadedObs: number,
  }

const Toolbar = ( {
  isExplore,
  isLoggedIn,
  syncObservations,
  setView,
  numOfUnuploadedObs
}: Props ): Node => (
  <>
    {!isExplore && (
      <View style={viewStyles.toggleButtons}>
        {!isLoggedIn && (
        <Pressable onPress={syncObservations}>
          <Icon
            name="sync"
            size={30}
            color={numOfUnuploadedObs > 0 ? colors.inatGreen : colors.gray}
          />
        </Pressable>
        )}
      </View>
    )}
    <View style={viewStyles.toggleButtons}>
      {isExplore && (
        <Pressable
          onPress={( ) => setView( "map" )}
          accessibilityRole="button"
          testID="Explore.toggleMapView"
        >
          <Icon name="map-outline" size={30} />
        </Pressable>
      )}
      <Pressable
        onPress={( ) => setView( "list" )}
        accessibilityRole="button"
      >
        <Icon name="format-list-bulleted" size={30} />
      </Pressable>
      <Pressable
        onPress={( ) => setView( "grid" )}
        testID="ObsList.toggleGridView"
        accessibilityRole="button"
      >
        <Icon name="grid-large" size={30} />
      </Pressable>
    </View>
  </>
);

export default Toolbar;
