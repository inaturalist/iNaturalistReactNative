import { ScrollView, View } from "components/styledComponents";
import React, { useEffect, useState } from "react";
import { Image } from "react-native";

import SoundSlide from "./SoundSlide";

const numColumns = 2;
const spacing = 6;

// A helper function to get the image dimensions
const getImageDimensions = async uri => new Promise( resolve => {
  Image.getSize( uri, ( width, height ) => {
    resolve( { width, height } );
  } );
} );

const photoUrl = photo => ( photo?.url
  ? photo.url.replace( "square", "large" )
  : photo.localFilePath );

const MasonryLayout = ( { items } ) => {
  const [columns, setColumns] = useState(
    Array.from( { length: numColumns }, () => [] )
  );

  useEffect( () => {
    const distributeItems = async () => {
      const newColumns = Array.from( { length: numColumns }, () => [] );

      const tilePromises = items.map( async item => {
        // If a sound, just return it
        if ( item.file_url ) {
          return item;
        }
        const imageDimensions = await getImageDimensions( photoUrl( item ) );
        return { ...item, ...imageDimensions };
      } );

      const tileData = await Promise.all( tilePromises );

      tileData.forEach( ( image, i ) => {
        const columnIndex = i % numColumns;
        newColumns[columnIndex].push( image );
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
    <Image
      key={`MasonryLayout.column${column}.photo_${index}`}
      source={{ uri: photoUrl( item ) }}
      style={imageStyle( item )}
      accessibilityIgnoresInvertColors
    />
  );

  const renderSound = ( item, index, column ) => (
    <SoundSlide
      key={`MasonryLayout.column${column}.photo_${index}`}
      sizeClass="w-full aspect-square"
      sound={item}
      isVisible
    />
  );

  const renderItem = ( item, index, column ) => (
    item.file_url
      ? renderSound( item, index, column )
      : renderImage( item, index, column )
  );

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
