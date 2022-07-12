// @flow
import * as React from "react";
import { Button } from "react-native-paper";

import { textStyles, viewStyles } from "../../../styles/sharedComponents/buttons/roundGreenButton";
import TranslatedText from "../TranslatedText";

type Props = {
  buttonText: string,
  count?: number,
  disabled?: boolean,
  handlePress: any,
  loading?: boolean,
  style?: any,
  testID: string
}

const RoundGreenButton = ( {
  buttonText,
  count,
  disabled,
  handlePress,
  loading,
  style,
  testID
}: Props ): React.Node => (
  <Button
    disabled={disabled}
    loading={loading}
    onPress={handlePress}
    style={[style, viewStyles.greenButton, disabled && viewStyles.disabled]}
    testID={testID}
    uppercase={false}
  >
    <TranslatedText
      count={count}
      style={textStyles.greenButtonText}
      text={buttonText}
    />
  </Button>
);

export default RoundGreenButton;
