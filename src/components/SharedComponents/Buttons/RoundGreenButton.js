// @flow
import * as React from "react";
import { Button } from "react-native-paper";

import { viewStyles, textStyles } from "../../../styles/sharedComponents/buttons/roundGreenButton";
import TranslatedText from "../TranslatedText";

type Props = {
  buttonText: string,
  handlePress: any,
  testID: string,
  disabled?: boolean,
  count?: number
}

const RoundGreenButton = ( { buttonText, handlePress, testID, disabled, count }: Props ): React.Node => (
  <Button
    style={[viewStyles.greenButton, disabled && viewStyles.disabled]}
    onPress={handlePress}
    testID={testID}
    disabled={disabled}
  >
    <TranslatedText
      style={textStyles.greenButtonText}
      text={buttonText}
      count={count}
    />
  </Button>
);

export default RoundGreenButton;
