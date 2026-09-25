import {
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
  return (
    <RadioButtonSheet
      confirm={confirm}
      headerText={t( "LOCATION-PERMISSIONS" )}
      loading={loading}
      onPressClose={onPressClose}
    />
  );
};

export default JoinSheet;
