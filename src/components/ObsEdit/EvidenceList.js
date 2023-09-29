// @flow

import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { ActivityIndicator } from "react-native";
// eslint-disable-next-line import/no-extraneous-dependencies
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import Photo from "realmModels/Photo";
import colors from "styles/tailwindColors";

type Props = {
  evidenceList: Array<string>,
  handleAddEvidence?: Function,
  handleDragAndDrop: Function,
  showMediaViewer: Function,
  savingPhoto: boolean
}

const EvidenceList = ( {
  evidenceList,
  handleAddEvidence,
  handleDragAndDrop,
  showMediaViewer,
  savingPhoto
}: Props ): Node => {
  const imageClass = "h-16 w-16 justify-center mx-1.5 rounded-lg";

  const renderPhoto = ( { item, getIndex, drag } ) => (
    <ScaleDecorator>
      <Pressable
        onLongPress={drag}
        accessibilityRole="button"
        onPress={( ) => showMediaViewer( getIndex( ) )}
        className={classnames( imageClass )}
      >
        <View className="rounded-lg overflow-hidden">
          <Image
            source={{ uri: Photo.displayLocalOrRemoteSquarePhoto( item.photo ) }}
            testID="ObsEdit.photo"
            className="w-fit h-full flex items-center justify-center"
            accessibilityIgnoresInvertColors
          />
        </View>
      </Pressable>
    </ScaleDecorator>
  );

  const renderFooter = ( ) => {
    if ( savingPhoto ) {
      return (
        <View className={classnames( imageClass )}>
          <View className="rounded-lg overflow-hidden">
            <View className="bg-lightGray w-fit h-full justify-center">
              <ActivityIndicator />
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  const renderHeader = ( ) => (
    <Pressable
      accessibilityRole="button"
      onPress={handleAddEvidence}
      className={
        `${imageClass} border border-[2px] border-darkGray items-center justify-center`
      }
    >
      <INatIcon name="plus-bold" size={27} color={colors.darkGray} />
    </Pressable>
  );

  return (
    <View className="mt-5">
      <DraggableFlatList
        horizontal
        data={evidenceList}
        renderItem={renderPhoto}
        keyExtractor={item => item.photo?.url || item.photo?.localFilePath}
        onDragEnd={handleDragAndDrop}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

export default EvidenceList;
