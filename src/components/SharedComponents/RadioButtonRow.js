// @flow
import classnames from "classnames";
import {
  Body1,
  INatIcon,
  List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
import { Platform } from "react-native";
import { RadioButton, useTheme } from "react-native-paper";

type Props = {
  value: string,
  icon: string,
  checked: boolean,
  onPress: Function,
  label: string,
  description: ?string,
  style: ?Object
}

const RadioButtonRow = ( {
  value, icon, checked, onPress, label, description, style
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

  const iconLabel = useMemo( () => (
    <View className="flex-row">
      <Body1 className="mr-2">{label}</Body1>
      <INatIcon name={icon} size={19} color={theme.colors.secondary} />
    </View>
  ), [label, icon, theme.colors.secondary] );

  const labelComponent = useMemo( () => {
    if ( icon ) return iconLabel;
    return label;
  }, [icon, iconLabel, label] );

  return (
    <RadioButton.Group>
      <RadioButton.Item
        value={value}
        status={checked
          ? "checked"
          : "unchecked"}
        onPress={onPress}
        mode="android"
        label={labelComponent}
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
