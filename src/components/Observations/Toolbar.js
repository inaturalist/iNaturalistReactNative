// @flow

import { Pressable, View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { ActivityIndicator } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useCurrentUser from "sharedHooks/useCurrentUser";

type Props = {
  setView: Function
  }

const Toolbar = ( { setView }: Props ): Node => {
  const currentUser = useCurrentUser( );
  const obsEditContext = useContext( ObsEditContext );
  const loading = obsEditContext?.loading;
  const syncObservations = obsEditContext?.syncObservations;

  return (
    <View className="py-5 flex-row justify-between bg-white">
      {currentUser ? (
        <Pressable
          onPress={syncObservations}
          className="mx-3"
          accessibilityRole="button"
          disabled={loading}
        >
          <IconMaterial name="sync" size={30} />
        </Pressable>
      ) : (
        <View className="mx-3" />
      )}
      {loading && <ActivityIndicator />}
      <View className="flex-row mx-3">
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
};

export default Toolbar;
