// @flow

import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { ImageBackground, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useEffect, useState
} from "react";
import {
  ActivityIndicator,
  FlatList
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Modal from "react-native-modal";
import { IconButton, useTheme } from "react-native-paper";
import colors from "styles/tailwindColors";

type Props = {
  emptyComponent?: Function,
  photoUris: Array<string>,
  setSelectedPhotoIndex?: Function,
  selectedPhotoIndex?: number,
  containerStyle?: string,
  savingPhoto?: boolean,
  handleAddEvidence?: Function,
  showAddButton?: boolean,
  deletePhoto?: Function,
  screenBreakpoint?: string
}

const PhotoCarousel = ( {
  photoUris,
  emptyComponent,
  setSelectedPhotoIndex,
  selectedPhotoIndex,
  containerStyle,
  savingPhoto,
  handleAddEvidence,
  showAddButton = false,
  deletePhoto,
  screenBreakpoint
}: Props ): Node => {
  const theme = useTheme( );
  const [deletePhotoMode, setDeletePhotoMode] = useState( false );
  const imageClass = "justify-center items-center";

  useEffect( () => {
    if ( photoUris.length === 0 && deletePhotoMode ) {
      setDeletePhotoMode( false );
    }
  }, [photoUris.length, deletePhotoMode] );

  const renderSkeleton = ( ) => ( savingPhoto ? (
    <View className={classnames( "bg-lightGray justify-center", {
      "rounded-sm w-[42px] h-[42px] mx-[3px]":
      ["sm", "md"].includes( screenBreakpoint ),
      "rounded-md w-[83px] h-[83px] mx-[8.5px]":
      ["lg", "xl", "2xl"].includes( screenBreakpoint )
    } )}
    >
      <ActivityIndicator />
    </View>
  ) : null );

  const renderPhotoOrEvidenceButton = ( { item, index } ) => {
    if ( item === "add" ) {
      return (
        <Pressable
          accessibilityRole="button"
          onPress={handleAddEvidence}
          className={`${imageClass} border border-lightGray mt-6`}
        >
          <INatIcon name="plus-bold" size={27} color={colors.darkGray} />
        </Pressable>
      );
    }

    return (
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
            } else if ( setSelectedPhotoIndex ) {
              setSelectedPhotoIndex( index );
            }
          }}
          className={classnames(
            imageClass,
            {
              "mt-12": containerStyle === "camera",
              "mt-6": containerStyle !== "camera",
              "border border-selectionGreen border-4":
              selectedPhotoIndex === index
            },
            {
              "mx-[3px] mt-0": ["sm", "md"].includes( screenBreakpoint ),
              "mx-[8.5px] mt-0": ["lg", "xl", "2xl"].includes( screenBreakpoint )
            }
          )}
        >
          <View
            testID="PhotoCarousel.photo"
            className={classnames(
              "overflow-hidden",
              {
                "rounded-sm w-[42px] h-[42px]": ["sm", "md"].includes( screenBreakpoint ),
                "rounded-md w-[83px] h-[83px]": ["lg", "xl", "2xl"].includes( screenBreakpoint )
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
  };

  const data = [...photoUris];
  if ( showAddButton ) data.unshift( "add" );

  const photoPreviewsList = (
    <FlatList
      data={data}
      renderItem={renderPhotoOrEvidenceButton}
      horizontal
      ListEmptyComponent={savingPhoto ? renderSkeleton( ) : emptyComponent}

    />
  );

  return deletePhotoMode ? (
    <Modal
      visible
      onBackdropPress={() => setDeletePhotoMode( false )}
      backdropOpacity={0}
      // eslint-disable-next-line react-native/no-inline-styles
      style={{ margin: 0 }}
    >
      <View className="absolute top-0 pt-[50px]">
        {photoPreviewsList}
      </View>
    </Modal>
  ) : photoPreviewsList;
};

export default PhotoCarousel;
