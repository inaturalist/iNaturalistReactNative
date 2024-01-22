// @flow
import { useNavigation } from "@react-navigation/native";
import {
  INatIcon,
  INatIconButton, PhotoCount, PhotoScroll
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
  useTranslation
} from "sharedHooks";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

import HeaderKebabMenu from "./HeaderKebabMenu";

type Props = {
  belongsToCurrentUser: boolean,
  faveOrUnfave: Function,
  isOnline: boolean,
  observationId: number,
  photos: Array<Object>,
  userFav: ?boolean,
  observation: Object
}

const PhotoDisplay = ( {
  belongsToCurrentUser,
  faveOrUnfave,
  isOnline,
  observationId,
  photos,
  userFav,
  observation
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const setObservations = useStore( state => state.setObservations );

  const editButton = useMemo(
    () => (
      <INatIconButton
        testID="ObsDetail.editButton"
        onPress={() => {
          setObservations( [observation] );
          navigation.navigate( "ObsEdit" );
        }}
        icon="pencil"
        color={colors.white}
        className="absolute top-3 right-3"
        accessibilityLabel={t( "Edit" )}
      />
    ),
    [t, navigation, observation, setObservations]
  );

  const kebabMenu = useCallback( ( ) => (
    <View className="absolute top-3 right-3">
      <HeaderKebabMenu observationId={observationId} />
    </View>
  ), [observationId] );

  const displayPhoto = useCallback( ( ) => {
    if ( photos.length > 0 ) {
      return (
        <View className="bg-black">
          {
            isOnline
              ? (
                <PhotoScroll
                  photos={photos}
                />
              )
              : (
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
              )
          }
          {/* TODO: a11y props are not passed down into this 3.party */}
          { belongsToCurrentUser
            ? editButton
            : kebabMenu( )}
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
        className="bg-black flex-row justify-center items-center h-72"
        accessible
        accessibilityLabel={t( "Observation-has-no-photos-and-no-sounds" )}
      >

        { belongsToCurrentUser
          ? editButton
          : kebabMenu( )}
        <INatIcon
          name="noevidence"
          size={96}
          color={colors.white}
        />
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
      </View>
    );
  }, [
    belongsToCurrentUser,
    kebabMenu,
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
