// @flow
import * as React from "react";
import { Button } from "react-native-paper";

import { viewStyles, textStyles } from "../../../styles/sharedComponents/buttons/roundGrayButton";
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

const RoundGrayButton = ( {
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
    style={[style, viewStyles.grayButton, disabled && viewStyles.disabled]}
    testID={testID}
    uppercase={false}
  >
    <TranslatedText
      count={count}
      style={[textStyles.grayButtonText, disabled && textStyles.disabled]}
      text={buttonText}
    />
  </Button>
);

export default RoundGrayButton;
