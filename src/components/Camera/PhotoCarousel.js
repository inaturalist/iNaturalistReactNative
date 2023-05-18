// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { ImageBackground, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Modal from "react-native-modal";
import { IconButton, useTheme } from "react-native-paper";

type Props = {
  emptyComponent?: Function,
  selectedPhotoIndex?: number,
  containerStyle?: string,
  savingPhoto?: boolean,
  deletePhoto?: Function,
  isLandscapeMode?:boolean,
  isLargeScreen?: boolean,
  setMediaViewerUris: Function,
  photoUris: Array<string>,
  setSelectedPhotoIndex: Function
}

const PhotoCarousel = ( {
  emptyComponent,
  selectedPhotoIndex,
  containerStyle,
  savingPhoto,
  deletePhoto,
  isLandscapeMode,
  isLargeScreen,
  setMediaViewerUris,
  photoUris,
  setSelectedPhotoIndex
}: Props ): Node => {
  const theme = useTheme( );
  const navigation = useNavigation( );
  const [deletePhotoMode, setDeletePhotoMode] = useState( false );
  const imageClass = "justify-center items-center";
  const smallPhotoClass = "rounded-sm w-[42px] h-[42px]";
  const largePhotoClass = "rounded-md w-[83px] h-[83px]";

  useEffect( () => {
    if ( photoUris.length === 0 && deletePhotoMode ) {
      setDeletePhotoMode( false );
    }
  }, [photoUris.length, deletePhotoMode] );

  const renderSkeleton = ( ) => ( savingPhoto
    ? (
      <View
        className={classnames(
          "flex",
          {
            "w-fit h-full": isLargeScreen && isLandscapeMode
          },
          imageClass
        )}
      >
        <View
          className={classnames(
            "bg-lightGray justify-center",
            {
              [`${smallPhotoClass} mx-[3px]`]: !isLargeScreen,
              [`${largePhotoClass} mx-[8.5px]`]: isLargeScreen && !isLandscapeMode,
              [`${largePhotoClass}`]: isLargeScreen && isLandscapeMode
            }
          )}
        >
          <ActivityIndicator />
        </View>
      </View>
    )
    : null );

  const renderPhotoOrEvidenceButton = ( { item, index } ) => (
    <>
      <Pressable
        accessibilityRole="button"
        onLongPress={( ) => {
          if ( deletePhoto ) {
            setDeletePhotoMode( mode => !mode );
          }
        }}
        onPress={( ) => {
          if ( deletePhotoMode && deletePhoto ) {
            deletePhoto( item );
          } else {
            setSelectedPhotoIndex( index );
            setMediaViewerUris( photoUris );
            navigation.navigate( "MediaViewer" );
          }
        }}
        className={classnames(
          imageClass,
          {
            "mt-12": containerStyle === "camera",
            "mt-6": containerStyle !== "camera",
            "border border-selectionGreen border-4": selectedPhotoIndex === index
          },
          {
            "mx-[3px] mt-0": !isLargeScreen,
            "mx-[8.5px] mt-0": isLargeScreen && isLandscapeMode,
            "my-[18px] mt-0": isLargeScreen && !isLandscapeMode
          }
        )}
      >
        <View
          testID="PhotoCarousel.photo"
          className={classnames(
            "overflow-hidden",
            {
              [`${smallPhotoClass}`]: !isLargeScreen,
              [`${largePhotoClass}`]: isLargeScreen
            }
          )}
        >
          <ImageBackground
            source={{ uri: item }}
            className={classnames(
              `w-fit h-full flex ${imageClass}`
            )}
          >
            {deletePhotoMode && (
              <LinearGradient
                className="absolute inset-0"
                colors={["rgba(0, 0, 0, 0.5)", "rgba(0, 0, 0, 0.5)"]}
              />
            )}
            {( containerStyle === "camera" && deletePhotoMode ) && (
              <IconButton
                icon="trash-outline"
                mode="contained-tonal"
                iconColor={theme.colors.onPrimary}
                containerColor="rgba(0, 0, 0, 0.5)"
                size={30}
              />
            )}
          </ImageBackground>
        </View>
      </Pressable>
      {index === photoUris.length - 1 && renderSkeleton( )}
    </>
  );

  const photoPreviewsList = (
    <FlatList
      data={[...photoUris]}
      renderItem={renderPhotoOrEvidenceButton}
      horizontal={!isLargeScreen || !!isLandscapeMode}
      ListEmptyComponent={savingPhoto
        ? renderSkeleton( )
        : emptyComponent}
    />
  );

  return deletePhotoMode
    ? (
      <Modal
        visible
        onBackdropPress={() => setDeletePhotoMode( false )}
        backdropOpacity={0}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{ margin: 0 }}
      >
        <View className={classnames(
          "absolute top-0 pt-[50px]",
          {
            "ml-[18px]": isLargeScreen && isLandscapeMode
          }
        )}
        >
          {photoPreviewsList}
        </View>
      </Modal>
    )
    : photoPreviewsList;
};

export default PhotoCarousel;
