// @flow

import React, { useContext, useState } from "react";
import { Pressable, Image, FlatList, ActivityIndicator } from "react-native";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";

import useAndroidPermission from "./hooks/useAndroidPermission";
import { imageStyles, viewStyles } from "../../styles/photoLibrary/photoGallery";
// import GroupPhotosHeader from "./GroupPhotosHeader";
import { ObsEditContext } from "../../providers/contexts";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";

const GroupPhotos = ( ): Node => {
  const navigation = useNavigation( );
  const {
    selectedPhotos
  } = useContext( ObsEditContext );
  const [groupedPhotos, setGroupedPhotos] = useState( [] );
  // const [photosToGroupOrUngroup, setPhotosToGroupOrUngroup] = useState( [] );
  // observation 1: 3 photos
  // observation 2: 2 photos
  // observation 3: 1 photo

  // {
  //   1: [{}, {}, {}],
  //   2: [{}, {}],
  //   3: [{}]
  // }

  // pass this groupedPhotos object to ObsEdit
  // or store in provider

  // const navToObsEdit = ( ) => navigation.navigate( "ObsEdit" );

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
            imageStyles.imagesForGrouping
            // isSelected ? imageStyles.selected : null
          ]}
        />
      </Pressable>
    );
  };

  const extractKey = ( item, index ) => `${item}${index}`;

  const groupPhotos = ( ) => {
    // this is where the combine photos
    // separate photos
    // and delete photos functionality will go
    // in a picker
    // it will also include a next button to navigate to obs edit
    // with multiple observations
    return <></>;
  };

  return (
    <ViewNoFooter>
      {console.log( selectedPhotos, "selected photos in group photos screen" )}
      {/* <GroupPhotosHeader /> */}
      <FlatList
        contentContainerStyle={viewStyles.centerImages}
        data={orderByTimestamp( )}
        initialNumToRender={4}
        keyExtractor={extractKey}
        numColumns={2}
        renderItem={renderImage}
        // onEndReached={fetchMorePhotos}
        testID="GroupPhotos.list"
        ListEmptyComponent={( ) => <ActivityIndicator />}
      />
      {groupPhotos( )}
    </ViewNoFooter>
  );
};

export default GroupPhotos;
