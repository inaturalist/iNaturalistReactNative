import { ScrollView, View } from "components/styledComponents";
import React, { useEffect, useState } from "react";
import { ImageStyle, StyleProp } from "react-native";
import Photo from "realmModels/Photo";
import Sound from "realmModels/Sound";
import type { RealmPhoto, RealmSound } from "realmModels/types";
import getImageDimensions, { ImageDimensions } from "sharedHelpers/getImageDimensions";

import PhotoContainer from "./PhotoContainer";
import SoundContainer from "./SoundContainer";

type PhotoItem = Photo & RealmPhoto;
type PhotoItemWithDimensions = PhotoItem & ImageDimensions;
type SoundItem = Sound & RealmSound;
type Item = PhotoItem | SoundItem;
type OriginalIndex = { originalIndex: number };
type HydratedItem = ( SoundItem | PhotoItemWithDimensions ) & OriginalIndex;

const numColumns = 2;
const spacing = 6;

const photoUrl = ( photo: PhotoItem ) => {
  const url = Photo.displayLocalOrRemoteLargePhoto( photo );
  if ( !url ) {
    throw new Error( "No photo URL found" );
  }
  return url;
};

// Photos have a `url` property, sounds have a `file_url` property
const isSound = ( item: Item ): item is SoundItem => (
  "file_url" in item
);

interface Props {
  items: Item[];
  onImagePress: ( index: number ) => void;
}

const MasonryLayout = ( { items, onImagePress }: Props ) => {
  const [columns, setColumns] = useState<HydratedItem[][]>(
    Array.from( { length: numColumns }, () => [] )
  );

  useEffect( () => {
    const distributeItems = async () => {
      const newColumns: HydratedItem[][] = ( Array.from( { length: numColumns }, () => [] ) );

      const itemPromises = items.map( async item => {
        // If a sound, just return it
        if ( isSound( item ) ) {
          return item;
        }
        const imageDimensions = await getImageDimensions( photoUrl( item ) );
        return Object.assign( item, imageDimensions );
      } );

      const itemData = await Promise.all( itemPromises );

      itemData.forEach( ( item, i ) => {
        const columnIndex = i % numColumns;
        const withIndex = Object.assign( item, { originalIndex: i } );
        newColumns[columnIndex].push( withIndex );
      } );

      setColumns( newColumns );
    };

    distributeItems();
  }, [items] );

  const imageStyle = ( item: PhotoItemWithDimensions ): StyleProp<ImageStyle> => ( {
    width: "100%",
    height: undefined,
    aspectRatio: item.width / item.height,
    marginBottom: spacing
  } );

  const renderImage = (
    item: PhotoItemWithDimensions & OriginalIndex,
    index: number,
    column: number
  ) => (
    <PhotoContainer
      key={`MasonryLayout.column${column}.photo_${index}`}
      photo={item}
      style={imageStyle( item )}
      onPress={() => onImagePress( item.originalIndex )}
    />
  );

  const renderSound = ( item: SoundItem, index: number, column: number ) => (
    <SoundContainer
      key={`MasonryLayout.column${column}.sound_${index}`}
      sizeClass="w-full aspect-square"
      sound={item}
      isVisible
      autoPlay={false}
    />
  );

  const renderItem = (
    item: HydratedItem,
    index: number,
    column: number
  ) => ( isSound( item )
    ? renderSound( item, index, column )
    : renderImage( item, index, column ) );

  return (
    <ScrollView>
      <View className="flex-row">
        <View className="flex-col flex-1">
          {columns[0].map( ( item, index ) => renderItem( item, index, 1 ) )}
        </View>
        <View className="w-[6px]" />
        <View className="flex-col flex-1">
          {columns[1].map( ( item, index ) => renderItem( item, index, 2 ) )}
        </View>
      </View>
    </ScrollView>
  );
};

export default MasonryLayout;
