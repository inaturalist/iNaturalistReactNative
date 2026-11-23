import { BottomSheet } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";

interface Props {
  onClose: ( ) => void;
}

// Opened from the camera tips button. Content comes in a follow-up
const CameraTipsSheet = ( { onClose }: Props ) => (
  <BottomSheet onPressClose={onClose} testID="CameraTipsSheet">
    <View />
  </BottomSheet>
);

export default CameraTipsSheet;
