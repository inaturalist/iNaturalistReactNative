// @flow

import { Body2, INatIcon } from "components/SharedComponents";
import type { Node } from "react";
import React, { useMemo, useState } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useTheme } from "react-native-paper";

type Props = {
  text: string
}

const Checkbox = ( { text }: Props ): Node => {
  const theme = useTheme( );
  const [isChecked, setIsChecked] = useState( false );

  const renderCheckboxText = useMemo( ( ) => <Body2 className="ml-3">{text}</Body2>, [text] );
  const renderIcon = useMemo( ( ) => (
    <INatIcon
      name="checkmark"
      color={theme.colors.onPrimary}
      size={19}
    />
  ), [theme] );

  const innerIconStyle = {
    borderRadius: 6,
    borderWidth: 2,
    borderColor: isChecked
      ? theme.colors.secondary
      : theme.colors.primary
  };

  return (
    <BouncyCheckbox
      size={25}
      fillColor={theme.colors.secondary}
      unfillColor={theme.colors.onPrimary}
      iconComponent={renderIcon}
      onPress={( ) => setIsChecked( !isChecked )}
      textComponent={renderCheckboxText}
      innerIconStyle={innerIconStyle}
    />
  );
};

export default Checkbox;
