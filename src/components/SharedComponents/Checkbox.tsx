import { Body2, INatIcon } from "components/SharedComponents";
import React, { useMemo } from "react";
import BouncyCheckbox from "react-native-bouncy-checkbox";
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
  text,
}: Props ) => {
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

  const checkedBorderColor = colors.inatGreen;
  const uncheckedBorderColor = transparent
    ? colors.white
    : colors.darkGray;

  const innerIconStyle = {
    borderRadius: 6,
    borderWidth: 2,
    borderColor: isChecked
      ? checkedBorderColor
      : uncheckedBorderColor,
  };

  const iconStyle = { borderRadius: 6 };

  return (
    <BouncyCheckbox
      size={25}
      fillColor={colors.inatGreen}
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
        checked: isChecked,
      }}
    />
  );
};

export default Checkbox;
