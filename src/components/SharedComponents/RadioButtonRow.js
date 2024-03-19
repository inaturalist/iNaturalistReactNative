// @flow
import classnames from "classnames";
import { List2 } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { Platform } from "react-native";
import { RadioButton, useTheme } from "react-native-paper";

type Props = {
  value: string,
  checked: boolean,
  onPress: Function,
  label: string,
  description: ?string,
  style: ?Object
}

const RadioButtonRow = ( {
  value, checked, onPress, label, description, style
}: Props ): Node => {
  const theme = useTheme( );

  const labelStyle = {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: `Whitney-Light${Platform.OS === "ios"
      ? ""
      : "-Pro"}`,
    color: theme.colors.primary,
    fontWeight: "500",
    textAlign: "left",
    textAlignVertical: "center"
  };

  return (
    <RadioButton.Group>
      <RadioButton.Item
        value={value}
        status={checked
          ? "checked"
          : "unchecked"}
        onPress={onPress}
        mode="android"
        label={label}
        position="leading"
        labelStyle={labelStyle}
        className={classnames( "p-0" )}
        accessibilityLabel={label}
        style={style}
      />
      {description && (
        <List2 className="ml-[37px] mr-[33px] py-1">{description}</List2>
      )}
    </RadioButton.Group>
  );
};

export default RadioButtonRow;
