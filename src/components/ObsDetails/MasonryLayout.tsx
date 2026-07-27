import PhotoContainer from "components/ObsDetailsSharedComponents/Media/PhotoContainer";
import SoundContainer from "components/ObsDetailsSharedComponents/Media/SoundContainer";
import { ScrollView, View } from "components/styledComponents";
import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import Photo from "realmModels/Photo";

interface PhotoItem {
  id: number;
  url: string;
  localFilePath: string;
  attribution: string;
  hidden: boolean;
}

interface SoundItem {
  file_url: string;
  hidden: boolean;
}

const numColumns = 2;
const spacing = 6;

const photoUrl = ( photo: PhotoItem ): string => (
  Photo.displayLocalOrRemoteLargePhoto( photo )
);

const MasonryLayout = ( { items, onImagePress } ) => {
  const [columns, setColumns] = useState(
    Array.from( { length: numColumns }, () => [] ),
  );

  useEffect( () => {
    const distributeItems = async () => {
      const newColumns = Array.from( { length: numColumns }, () => [] );

      const itemPromises = items.map( async item => {
        // If a sound, just return it
        if ( item.file_url ) {
          return item;
        }
        const imageDimensions = await Image.getSize( photoUrl( item ) );
        return { ...item, ...imageDimensions };
      } );

      const itemData = await Promise.all( itemPromises );

      itemData.forEach( ( item, i ) => {
        const columnIndex = i % numColumns;
        item.originalIndex = i;
        newColumns[columnIndex].push( item );
      } );

      setColumns( newColumns );
    };

    distributeItems();
  }, [items] );

  const imageStyle = ( item: PhotoItem ) => ( {
    width: "100%" as const,
    height: undefined,
    aspectRatio: item.width / item.height,
    marginBottom: spacing,
  } );

  const renderImage = ( item: PhotoItem, index: number, column: number ) => (
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
    />
  );

  const renderItem = (
    item: SoundItem | PhotoItem,
    index: number,
    column: number,
  ) => ( item.file_url
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
