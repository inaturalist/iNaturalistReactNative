import {
  Button,
  RadioButtonSheet,
} from "components/SharedComponents";
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

  return (
    <RadioButtonSheet
      confirm={confirm}
      confirmText={t( "CONFIRM-AND-JOIN" )}
      headerText={t( "LOCATION-PERMISSIONS" )}
      loading={loading}
      onPressClose={onPressClose}
      secondaryButton={cancelButton}
    />
  );
};

export default JoinSheet;
