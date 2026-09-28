import {
  Button,
  RadioButtonSheet,
} from "components/SharedComponents";
import React, { useMemo } from "react";
import useTranslation from "sharedHooks/useTranslation";

export enum LEAVE_KEEP {
  KEEP = "true",
  REVOKE = "revoke",
  REMOVE = "false",
}

interface Props {
  confirm: ( checkboxValue: LEAVE_KEEP ) => void;
  loading?: boolean;
  onPressClose: ( ) => void;
}

const LeaveSheet = ( {
  confirm,
  loading,
  onPressClose,
}: Props ) => {
  const { t } = useTranslation( );

  const radioValues = useMemo(
    () => ( {
      keep: {
        value: LEAVE_KEEP.KEEP,
      },
      revoke: {
        value: LEAVE_KEEP.REVOKE,
      },
      remove: {
        label: t( "No" ),
        value: LEAVE_KEEP.REMOVE,
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

  return (
    <RadioButtonSheet
      confirm={confirm}
      confirmText={t( "LEAVE" )}
      headerText={t( "LEAVE-PROJECT--question" )}
      radioValues={radioValues}
      requireSelectionChange={false}
      loading={loading}
      selectedValue={LEAVE_KEEP.KEEP}
      testID="LeaveSheet"
      onPressClose={onPressClose}
      secondaryButton={cancelButton}
    />
  );
};

export default LeaveSheet;
