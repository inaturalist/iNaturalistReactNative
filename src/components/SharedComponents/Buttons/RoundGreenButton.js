// @flow
import * as React from "react";
import { Pressable, Text } from "react-native";

import { viewStyles, textStyles } from "../../../styles/sharedComponents/buttons/roundGreenButton";

type Props = {
  buttonText: string,
  handlePress: any
}

const RoundGreenButton = ( { buttonText, handlePress }: Props ): React.Node => (
  <Pressable style={viewStyles.greenButton} onPress={handlePress}>
    <Text style={textStyles.greenButtonText}>
      {buttonText}
    </Text>
  </Pressable>
);

export default RoundGreenButton;
