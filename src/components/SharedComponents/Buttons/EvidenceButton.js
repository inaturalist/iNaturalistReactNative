// @flow
import * as React from "react";
import { Pressable } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { textStyles, viewStyles } from "styles/sharedComponents/buttons/evidenceButton";

type Props = {
  icon: any,
  disabled?: boolean,
  handlePress: any,
  style?: any
}

const EvidenceButton = ( {
  icon,
  disabled,
  handlePress,
  style
}: Props ): React.Node => (
  <Pressable
    disabled={disabled}
    onPress={handlePress}
    style={[style, viewStyles.greenButton, disabled && viewStyles.disabled]}
  >
    <Icon name={icon} size={35} style={textStyles.greenButtonIcon} />
  </Pressable>
);

export default EvidenceButton;
