// @flow

import type { Node } from "react";
import React from "react";
import { Pressable, View } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

import { viewStyles } from "../../../styles/observations/obsList";

type Props = {
  isExplore: boolean,
  isLoggedIn: ?boolean,
  syncObservations: Function,
  setView: Function
}

const Toolbar = ( {
  isExplore,
  isLoggedIn,
  syncObservations,
  setView
}: Props ): Node => (
  <>
    {!isExplore && (
      <View style={viewStyles.toggleButtons}>
        {isLoggedIn && (
        <Pressable onPress={syncObservations}>
          <IconMaterial name="sync" size={30} />
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
          <IconMaterial name="map" size={30} />
        </Pressable>
      )}
      <Pressable
        onPress={( ) => setView( "list" )}
        accessibilityRole="button"
      >
        <IconMaterial name="format-list-bulleted" size={30} />
      </Pressable>
      <Pressable
        onPress={( ) => setView( "grid" )}
        testID="ObsList.toggleGridView"
        accessibilityRole="button"
      >
        <IconMaterial name="grid-view" size={30} />
      </Pressable>
    </View>
  </>
);

export default Toolbar;
