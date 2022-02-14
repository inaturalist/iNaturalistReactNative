// @flow

import React from "react";
import { View, Pressable, Text } from "react-native";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";

import { viewStyles, textStyles } from "../../styles/photoLibrary/photoGalleryHeader";

type Props = {
  photos: number,
  observations: number,
  isSelected: boolean,
  clearSelection: Function
}

const GroupPhotosHeader = ( { photos, observations, isSelected, clearSelection }: Props ): Node => {
  const navigation = useNavigation( );

  const navBack = ( ) => navigation.goBack( );

  return (
    <>
      <View style={viewStyles.header}>
        <Pressable
          onPress={navBack}
        >
          <Text>back button</Text>
        </Pressable>
        <Text style={textStyles.header}>Group Photos</Text>
        {isSelected && (
          <Pressable
            onPress={clearSelection}
          >
            <Text style={textStyles.header}>cancel</Text>
          </Pressable>
        )}
      </View>
      <Text>{`${photos} photos, ${observations} observations`}</Text>
    </>
  );
};

export default GroupPhotosHeader;
