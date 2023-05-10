// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext,
  useEffect, useState
} from "react";
import { FlatList } from "react-native";
import colors from "styles/tailwindColors";

type Props = {
  photoUris: Array<string>,
  handleAddEvidence?: Function
}

const EvidenceList = ( {
  photoUris,
  handleAddEvidence
}: Props ): Node => {
  const {
    setMediaViewerUris
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const [deletePhotoMode, setDeletePhotoMode] = useState( false );
  const imageClass = "h-16 w-16 justify-center mx-1.5 rounded-lg";

  useEffect( () => {
    if ( photoUris.length === 0 && deletePhotoMode ) {
      setDeletePhotoMode( false );
    }
  }, [photoUris.length, deletePhotoMode] );

  const renderPhotoOrEvidenceButton = ( { item, index } ) => {
    if ( item === "add" ) {
      return (
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
    }

    return (
      <Pressable
        accessibilityRole="button"
        onPress={( ) => {
          setMediaViewerUris( photoUris );
          navigation.navigate( "MediaViewer", {
            // skip the add evidence button
            initialPhotoSelected: index - 1
          } );
        }}
        className={classnames( imageClass )}
      >
        <View className="rounded-lg overflow-hidden">
          <Image
            source={{ uri: item }}
            testID="ObsEdit.photo"
            className="w-fit h-full flex items-center justify-center"
            accessibilityIgnoresInvertColors
          />
        </View>
      </Pressable>
    );
  };

  const data = [...photoUris];
  data.unshift( "add" );

  return (
    <View className="mt-5">
      <FlatList
        data={data}
        renderItem={renderPhotoOrEvidenceButton}
        horizontal
      />
    </View>
  );
};

export default EvidenceList;
