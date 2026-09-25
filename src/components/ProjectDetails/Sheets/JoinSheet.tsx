import {
  Body3,
  Button,
  RadioButtonSheet,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useMemo } from "react";
import useTranslation from "sharedHooks/useTranslation";

export enum COORDINATE_ACCESS {
  OBSERVER = "observer",
  ANY = "any",
  NONE = "none",
}

interface Props {
  confirm: ( checkboxValue: COORDINATE_ACCESS ) => void;
  loading?: boolean;
  onPressClose: ( ) => void;
}

const JoinSheet = ( {
  confirm,
  loading,
  onPressClose,
}: Props ) => {
  const { t } = useTranslation( );

  const radioValues = useMemo(
    () => ( {
      observer: {
        label: t( "Yes-but-only-if-I-add-the-observation-to-the-project-myself" ),
        value: COORDINATE_ACCESS.OBSERVER,
      },
      any: {
        label: t( "Yes-no-matter-who-adds-the-observation-to-the-project" ),
        value: COORDINATE_ACCESS.ANY,
      },
      none: {
        label: t( "No" ),
        value: COORDINATE_ACCESS.NONE,
      },
    } ),
    [t],
  );

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
      radioValues={radioValues}
      requireSelectionChange={false}
      loading={loading}
      testID="JoinSheet"
      onPressClose={onPressClose}
      secondaryButton={cancelButton}
      topDescriptionText={topDescriptionText}
    />
  );
};

export default JoinSheet;
