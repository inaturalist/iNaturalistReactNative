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
  confirm: ( leaveKeep: LEAVE_KEEP ) => void;
  loading?: boolean;
  observationsCount: number;
  onPressClose: ( ) => void;
}

const LeaveSheet = ( {
  confirm,
  loading,
  observationsCount,
  onPressClose,
}: Props ) => {
  const { t } = useTranslation( );

  const radioValues = useMemo(
    () => ( {
      keep: {
        label: t( "Leave-your-observations-in-this-project" ),
        text: t( "Your-observations-will-stay-in-the-project" ),
        value: LEAVE_KEEP.KEEP,
      },
      revoke: {
        label: t( "Leave-your-observations-revoke-hidden-coordinates" ),
        text: t( "If-the-only-reason-youre-leaving-is-to-stop-project-curators" ),
        value: LEAVE_KEEP.REVOKE,
      },
      remove: {
        label: t(
          "Remove-all-your-observations-from-this-project-X",
          { count: observationsCount },
        ),
        text: t( "Keep-in-mind-that-project-curators" ),
        value: LEAVE_KEEP.REMOVE,
      },
    } ),
    [observationsCount, t],
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
      confirmLevel="warning"
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
