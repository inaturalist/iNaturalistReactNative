// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import KebabMenu from "components/SharedComponents/KebabMenu";
import { Pressable, Text, View } from "components/styledComponents";
import { UploadContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useState
} from "react";
import { useTranslation } from "react-i18next";
import { Menu } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "styles/tailwindColors";

import DeleteObservationDialog from "./DeleteObservationDialog";

type Props = {
  handleBackButtonPress: Function
}

const ObsEditHeader = ( { handleBackButtonPress }: Props ): Node => {
  const {
    currentObsIndex,
    setCurrentObsIndex,
    observations
  } = useContext( UploadContext );

  const { t } = useTranslation( );

  const [deleteDialogVisible, setDeleteDialogVisible] = useState( false );

  const showNextObservation = ( ) => setCurrentObsIndex( currentObsIndex + 1 );
  const showPrevObservation = ( ) => setCurrentObsIndex( currentObsIndex - 1 );

  const showDialog = ( ) => setDeleteDialogVisible( true );
  const hideDialog = ( ) => setDeleteDialogVisible( false );

  const renderKebabMenu = ( ) => (
    <>
      <DeleteObservationDialog
        deleteDialogVisible={deleteDialogVisible}
        hideDialog={hideDialog}
      />
      <KebabMenu>
        <Menu.Item
          onPress={showDialog}
          title={t( "Delete" )}
        />
      </KebabMenu>
    </>
  );

  return (
    <View className="flex-row justify-between">
      <HeaderBackButton onPress={handleBackButtonPress} tintColor={colors.black} />
      {observations.length === 1
        ? <Text className="text-2xl">{t( "New-Observation" )}</Text>
        : (
          <View className="flex-row items-center">
            <Pressable onPress={showPrevObservation} className="w-16">
              {currentObsIndex !== 0 && <Icon name="keyboard-arrow-left" size={30} />}
            </Pressable>
            <Text className="text-2xl">{`${currentObsIndex + 1} of ${observations.length}`}</Text>
            <Pressable onPress={showNextObservation} className="w-16">
              {( currentObsIndex !== observations.length - 1 )
                && <Icon name="keyboard-arrow-right" size={30} />}
            </Pressable>
          </View>
        )}
      {renderKebabMenu( )}
    </View>
  );
};

export default ObsEditHeader;
