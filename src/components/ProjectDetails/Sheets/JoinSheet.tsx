import {
  RadioButtonSheet,
} from "components/SharedComponents";
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
  return (
    <RadioButtonSheet
      confirm={confirm}
      loading={loading}
      onPressClose={onPressClose}
    />
  );
};

export default JoinSheet;
