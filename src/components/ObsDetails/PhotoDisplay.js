// @flow
import { useNavigation } from "@react-navigation/native";
import {
  INatIconButton,
  PhotoCount, PhotoScroll
} from "components/SharedComponents";
import BackButton from "components/SharedComponents/Buttons/BackButton";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useMemo
} from "react";
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

  const editButton = useMemo(
    () => (
      <INatIconButton
        testID="ObsDetail.editButton"
        onPress={() => navigation.navigate( "ObsEdit", { uuid } )}
        icon="pencil"
        color={colors.white}
        className="absolute top-3 right-3"
        accessibilityLabel={t( "Edit" )}
      />
    ),
    [t, navigation, uuid]
  );

  const displayPhoto = useCallback( ( ) => {
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
          <INatIconButton
            icon={userFav
              ? "star"
              : "star-bold-outline"}
            size={25}
            onPress={faveOrUnfave}
            color={colors.white}
            className="absolute bottom-3 right-3"
            accessibilityLabel={userFav
              ? t( "Remove-favorite" )
              : t( "Add-favorite" )}
          />
          <View className="absolute bottom-5 left-5">
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
  }, [
    editButton,
    faveOrUnfave,
    isOnline,
    photos,
    t,
    userFav
  ] );

  return (
    <>
      {displayPhoto( )}
      <View className="absolute top-3 left-3">
        <BackButton
          color={colors.white}
          onPress={( ) => navigation.goBack( )}
        />
      </View>
    </>
  );
};

export default PhotoDisplay;
