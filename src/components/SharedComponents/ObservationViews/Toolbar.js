// @flow

import type { Node } from "react";
import React from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { Pressable, View } from "../../styledComponents";

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
  <View className="py-5 flex-row justify-between bg-white">
    {!isExplore && isLoggedIn && (
    <Pressable onPress={syncObservations} className="mx-3">
      <Icon name="sync" size={30} />
    </Pressable>
    )}
    <View className="flex flex-row flex-nowrap mx-3">
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
  </View>
);

export default Toolbar;
