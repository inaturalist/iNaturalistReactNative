// @flow
import * as React from "react";
import { Pressable } from "react-native";

import { viewStyles, textStyles } from "../../../styles/sharedComponents/buttons/roundGreenButton";
import TranslatedText from "../TranslatedText";

type Props = {
  buttonText: string,
  handlePress: any,
  testID: string,
  disabled?: boolean,
  count: number
}

const RoundGreenButton = ( { buttonText, handlePress, testID, disabled, count }: Props ): React.Node => (
  <Pressable style={viewStyles.greenButton} onPress={handlePress} testID={testID} disabled={disabled}>
    <TranslatedText
      style={textStyles.greenButtonText}
      text={buttonText}
      count={count}
    />
  </Pressable>
);

export default RoundGreenButton;
