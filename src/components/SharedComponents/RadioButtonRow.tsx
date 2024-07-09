import {
  Body1,
  Body2,
  INatIcon,
  List2
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import { Trans } from "react-i18next";
import { GestureResponderEvent } from "react-native";
import { RadioButton, useTheme } from "react-native-paper";

interface Props {
  testID?: string;
  icon?: string;
  label: string;
  smallLabel?: boolean;
  description?: string;
  onPress: ( _e: GestureResponderEvent ) => void;
  checked: boolean;
  classNames?: string;
  value: string;
  showTaxon?: boolean;
  taxonNamePieces?: Object;
}

const RadioButtonRow = ( {
  testID,
  description,
  checked,
  classNames,
  label,
  onPress,
  icon,
  value,
  smallLabel = false,
  showTaxon,
  taxonNamePieces

}: Props ) => {
  const theme = useTheme( );

  const status = checked
    ? "checked"
    : "unchecked";

  const Label = smallLabel
    ? Body2
    : Body1;

  let commonName = "";
  let scientificName = "";
  if ( taxonNamePieces ) {
    ( { commonName, scientificName } = taxonNamePieces || undefined );
  }

  return (
    <Pressable className={classNames} testID={testID} accessibilityRole="button" onPress={onPress}>
      <View className="flex-row items-center">
        <RadioButton.Android
          onPress={onPress}
          value={value}
          status={status}
          accessibilityLabel={label}
        />
        <View className="ml-3 flex-row w-5/6">
          {( showTaxon && taxonNamePieces )
            ? (
              <Trans
                i18nKey={label}
                values={{ commonName, scientificName }}
                components={[<Label />, <Label className="italic" />]}
              />
            )
            : <Label className="mr-2">{label}</Label>}
          {icon && <INatIcon name={icon} size={19} color={theme.colors.secondary} />}
        </View>
      </View>
      {description && (
        <List2 className="ml-[32px] mt-[3px]">{description}</List2>
      )}
    </Pressable>
  );
};

export default RadioButtonRow;
