import { Body2, INatIcon } from "components/SharedComponents";
import React, { useMemo } from "react";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useTheme } from "react-native-paper";
import colors from "styles/tailwindColors";

interface Props {
  transparent?: boolean;
  accessibilityLabel: string;
  isChecked: boolean;
  onPress: ( _checked: boolean ) => void;
  text?: string;
}

const Checkbox = ( {
  transparent = false,
  accessibilityLabel,
  isChecked = false,
  onPress,
  text
}: Props ) => {
  const theme = useTheme( );

  const renderCheckboxText = useMemo( ( ) => {
    if ( !text ) { return null; }
    return <Body2 className="ml-3 flex-shrink">{text}</Body2>;
  }, [text] );

  const renderIcon = useMemo( ( ) => ( isChecked
    ? (
      <INatIcon
        name="checkmark"
        color={colors.white}
        size={19}
      />
    )
    : null ), [isChecked] );

  const checkedBorderColor = theme.colors.secondary;
  const uncheckedBorderColor = transparent
    ? colors.white
    : theme.colors.primary;

  const innerIconStyle = {
    borderRadius: 6,
    borderWidth: 2,
    borderColor: isChecked
      ? checkedBorderColor
      : uncheckedBorderColor
  };

  const iconStyle = { borderRadius: 6 };

  return (
    <BouncyCheckbox
      size={25}
      fillColor={theme.colors.secondary}
      unfillColor={transparent
        ? undefined
        : colors.white}
      iconComponent={renderIcon}
      onPress={onPress}
      isChecked={isChecked}
      disableBuiltInState
      textComponent={renderCheckboxText}
      iconStyle={iconStyle}
      innerIconStyle={innerIconStyle}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radio"
      accessibilityState={{
        checked: isChecked
      }}
    />
  );
};

export default Checkbox;
