// @flow

import React from "react";
import { View, Pressable, Text } from "react-native";
import type { Node } from "react";

import { viewStyles } from "../../styles/photoLibrary/photoGalleryHeader";

type Props = {
  combinePhotos: Function,
  separatePhotos: Function,
  removePhotos: Function,
  navToObsEdit: Function
}

const GroupPhotosFooter = ( {
  combinePhotos,
  separatePhotos,
  removePhotos,
  navToObsEdit
}: Props ): Node => (
  <View style={viewStyles.footer}>
    <View>
      <Pressable onPress={combinePhotos}>
        <Text>Combine photos</Text>
      </Pressable>
      <Pressable onPress={separatePhotos}>
        <Text>Separate photos</Text>
      </Pressable>
      <Pressable onPress={removePhotos}>
        <Text>Remove photos</Text>
      </Pressable>
    </View>
    <Pressable onPress={navToObsEdit}>
      <Text>next</Text>
    </Pressable>
  </View>
);

export default GroupPhotosFooter;
