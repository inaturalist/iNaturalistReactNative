// @flow

import React, { useContext } from "react";
import { Pressable, Image, FlatList, ActivityIndicator, View } from "react-native";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";

import useAndroidPermission from "./hooks/useAndroidPermission";
import { imageStyles, viewStyles } from "../../styles/photoLibrary/photoGallery";
// import GroupPhotosHeader from "./GroupPhotosHeader";
import { ObsEditContext } from "../../providers/contexts";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";

const GroupPhotos = ( ): Node => {
  const {
    selectedPhotos
  } = useContext( ObsEditContext );

  const orderByTimestamp = ( ) => {
    const albums = Object.keys( selectedPhotos );
    let unorderedPhotos = [];
    albums.forEach( album => {
      unorderedPhotos = unorderedPhotos.concat( selectedPhotos[album] );
    } );

    return unorderedPhotos.sort( ( a, b ) => {
      return b.timestamp - a.timestamp;
    } );
  };

  const renderImage = ( { item } ) => {
    // const isSelected = photosSelectedInAlbum.some( photo => photo.uri === item.uri );

    // const handlePress = ( ) => selectPhoto( isSelected, item );
    const handlePress = ( ) => console.log( "handle press in group photos" );

    const imageUri = { uri: item.uri };
    return (
      <Pressable
        onPress={handlePress}
        testID={`GroupPhotos.${item.uri}`}
      >
        <Image
          testID="GroupPhotos.photo"
          source={imageUri}
          style={[
            imageStyles.galleryImage
           //  isSelected ? imageStyles.selected : null
          ]}
        />
      </Pressable>
    );
  };

  const extractKey = ( item, index ) => `${item}${index}`;

  return (
    <ViewNoFooter>
      {console.log( selectedPhotos, "selected photos in group photos screen" )}
      {/* <GroupPhotosHeader /> */}
      <FlatList
        data={orderByTimestamp( )}
        initialNumToRender={4}
        keyExtractor={extractKey}
        numColumns={2}
        renderItem={renderImage}
        // onEndReached={fetchMorePhotos}
        testID="GroupPhotos.list"
        ListEmptyComponent={( ) => <ActivityIndicator />}
      />
    </ViewNoFooter>
  );
};

export default GroupPhotos;
