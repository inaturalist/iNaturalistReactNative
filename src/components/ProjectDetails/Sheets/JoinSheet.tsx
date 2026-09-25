import {
  Body3,
  Button,
  RadioButtonSheet,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
  confirm: ( ) => void;
  loading?: boolean;
  onPressClose: ( ) => void;
}

const JoinSheet = ( {
  confirm,
  loading,
  onPressClose,
}: Props ) => {
  console.log( "confirm", confirm );
  console.log( "loading", loading );
  console.log( "onPressClose", onPressClose );

  const { t } = useTranslation( );
  const cancelButton = (
    <Button
      level="neutral"
      text={t( "CANCEL" )}
      onPress={onPressClose}
      disabled={loading}
    />
  );

  const topDescriptionText = (
    <View className="px-3 pb-2">
      <Body3>{t( "Do-you-want-private-coordinates-visible-to-curators" )}</Body3>
    </View>
  );

  return (
    <RadioButtonSheet
      confirm={confirm}
      confirmText={t( "CONFIRM-AND-JOIN" )}
      headerText={t( "LOCATION-PERMISSIONS" )}
      loading={loading}
      onPressClose={onPressClose}
      secondaryButton={cancelButton}
      topDescriptionText={topDescriptionText}
    />
  );
};

export default JoinSheet;
