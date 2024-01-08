// @flow

import { Body2, INatIcon } from "components/SharedComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";

type Props = {
  isChecked: boolean,
  onPress: Function,
  text: string
}

const Checkbox = ( {
  isChecked = false,
  onPress,
  text
}: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );

  const renderCheckboxText = useMemo( ( ) => {
    if ( !text ) { return null; }
    return <Body2 className="ml-3 flex-shrink">{text}</Body2>;
  }, [text] );

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

  const iconStyle = { borderRadius: 6 };

  return (
    <BouncyCheckbox
      size={25}
      fillColor={theme.colors.secondary}
      unfillColor={theme.colors.onPrimary}
      iconComponent={renderIcon}
      onPress={onPress}
      textComponent={renderCheckboxText}
      iconStyle={iconStyle}
      innerIconStyle={innerIconStyle}
      accessibilityRole="radio"
      accessibilityLabel={t( "Checkmark" )}
      accessibilityState={{
        checked: isChecked
      }}
    />
  );
};

export default Checkbox;
