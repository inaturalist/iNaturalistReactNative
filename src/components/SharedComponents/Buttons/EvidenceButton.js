// @flow
import * as React from "react";
import { Pressable } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import { textStyles, viewStyles } from "styles/sharedComponents/buttons/evidenceButton";

type Props = {
  testID?: string,
  icon: any,
  disabled?: boolean,
  handlePress: any,
  style?: any
}

const EvidenceButton = ( {
  testID,
  icon,
  disabled,
  handlePress,
  style
}: Props ): React.Node => (
  <Pressable
    testID={testID}
    disabled={disabled}
    onPress={handlePress}
    style={[style, viewStyles.greenButton, disabled && viewStyles.disabled]}
  >
    <IconMaterial name={icon} size={35} style={textStyles.greenButtonIcon} />
  </Pressable>
);

export default EvidenceButton;
