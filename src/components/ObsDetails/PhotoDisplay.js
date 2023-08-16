// @flow
import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import {
  PhotoCount
} from "components/SharedComponents";
import PhotoScroll from "components/SharedComponents/PhotoScroll";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useMemo
} from "react";
import {
  Button as IconButton
} from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import {
  useIsConnected,
  useTranslation
} from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  faveOrUnfave: Function,
  userFav: ?boolean,
  photos: Array<Object>,
  uuid: string
}

const PhotoDisplay = ( {
  faveOrUnfave,
  userFav,
  photos,
  uuid
}: Props ): Node => {
  const isOnline = useIsConnected( );
  const { t } = useTranslation( );
  const navigation = useNavigation( );

  const editButton = useMemo( ( ) => (
    <IconButton
      onPress={( ) => navigation.navigate( "ObsEdit", { uuid } )}
      icon="pencil"
      textColor={colors.white}
      className="absolute top-3 right-3"
      accessible
      accessibilityRole="button"
      accessibilityLabel={t( "edit" )}
    />
  ), [t, navigation, uuid] );

  const displayPhoto = ( ) => {
    if ( !isOnline ) {
      // TODO show photos that are available offline
      return (
        <View className="bg-black flex-row justify-center">
          <IconMaterial
            name="wifi-off"
            color={colors.white}
            size={100}
            accessibilityRole="image"
            accessibilityLabel={t(
              "Observation-photos-unavailable-without-internet"
            )}
          />
        </View>
      );
    }
    if ( photos.length > 0 ) {
      return (
        <View className="bg-black">
          <PhotoScroll photos={photos} />
          {/* TODO: a11y props are not passed down into this 3.party */}
          { editButton }
          {userFav
            ? (
              <IconButton
                icon="star"
                size={25}
                onPress={faveOrUnfave}
                textColor={colors.white}
                className="absolute bottom-3 right-3"
                accessible
                accessibilityRole="button"
                accessibilityLabel={t( "favorite" )}
              />
            )
            : (
              <IconButton
                icon="star-bold-outline"
                size={25}
                onPress={faveOrUnfave}
                textColor={colors.white}
                className="absolute bottom-3 right-3"
                accessible
                accessibilityRole="button"
                accessibilityLabel={t( "favorite" )}
              />
            )}
          <View className="absolute bottom-3 left-3">
            <PhotoCount count={photos.length
              ? photos.length
              : 0}
            />
          </View>
        </View>
      );
    }
    return (
      <View
        className="bg-black flex-row justify-center"
        accessible
        accessibilityLabel={t( "Observation-has-no-photos-and-no-sounds" )}
      >

        { editButton }
        <IconMaterial
          color={colors.white}
          testID="ObsDetails.noImage"
          name="image-not-supported"
          size={100}
        />
      </View>
    );
  };

  return (
    <>
      {displayPhoto( )}
      <View className="absolute top-3 left-3">
        <HeaderBackButton
          tintColor={colors.white}
          onPress={( ) => navigation.goBack( )}
        />
      </View>
    </>
  );
};

export default PhotoDisplay;
