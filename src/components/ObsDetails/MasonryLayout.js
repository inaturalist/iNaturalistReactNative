import { ScrollView, View } from "components/styledComponents";
import React, { useEffect, useState } from "react";
import Photo from "realmModels/Photo.ts";
import getImageDimensions from "sharedHelpers/getImageDimensions";

import PhotoContainer from "./PhotoContainer";
import SoundContainer from "./SoundContainer";

const numColumns = 2;
const spacing = 6;

const photoUrl = photo => Photo.displayLocalOrRemoteLargePhoto( photo );

const MasonryLayout = ( { items, onImagePress } ) => {
  const [columns, setColumns] = useState(
    Array.from( { length: numColumns }, () => [] )
  );

  useEffect( () => {
    const distributeItems = async () => {
      const newColumns = Array.from( { length: numColumns }, () => [] );

      const itemPromises = items.map( async item => {
        // If a sound, just return it
        if ( item.file_url ) {
          return item;
        }
        const imageDimensions = await getImageDimensions( photoUrl( item ) );
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

  const imageStyle = item => ( {
    width: "100%",
    height: undefined,
    aspectRatio: item.width / item.height,
    marginBottom: spacing
  } );

  const renderImage = ( item, index, column ) => (
    <PhotoContainer
      key={`MasonryLayout.column${column}.photo_${index}`}
      photo={item}
      style={imageStyle( item )}
      onPress={() => onImagePress( item.originalIndex )}
    />
  );

  const renderSound = ( item, index, column ) => (
    <SoundContainer
      key={`MasonryLayout.column${column}.sound_${index}`}
      sizeClass="w-full aspect-square"
      sound={item}
      isVisible
    />
  );

  const renderItem = ( item, index, column ) => ( item.file_url
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
