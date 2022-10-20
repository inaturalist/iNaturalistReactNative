// @flow

import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

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
    {!isExplore && isLoggedIn ? (
      <Pressable onPress={syncObservations} className="mx-3">
        <IconMaterial name="sync" size={30} />
      </Pressable>
    ) : (
      <View className="mx-3" />
    )}
    <View className="flex flex-row flex-nowrap mx-3">
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
  </View>
);

export default Toolbar;
