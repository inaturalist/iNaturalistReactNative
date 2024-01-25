import { View } from "components/styledComponents";
import React, { useEffect, useState } from "react";
import { Image } from "react-native";

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
    const distributeImages = async () => {
      const newColumns = Array.from( { length: numColumns }, () => [] );

      const imagePromises = items.map( async item => {
        const imageDimensions = await getImageDimensions( photoUrl( item ) );
        return { ...item, ...imageDimensions };
      } );

      const images = await Promise.all( imagePromises );

      images.forEach( ( image, i ) => {
        const columnIndex = i % numColumns;
        newColumns[columnIndex].push( image );
      } );

      setColumns( newColumns );
    };

    distributeImages();
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

  return (
    <View className="flex-row">
      <View className="flex-col flex-1">
        {columns[0].map( ( item, index ) => renderImage( item, index, 1 ) )}
      </View>
      <View className="w-[6px]" />
      <View className="flex-col flex-1">
        {columns[1].map( ( item, index ) => renderImage( item, index, 2 ) )}
      </View>
    </View>
  );
};

export default MasonryLayout;
