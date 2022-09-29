// @flow

import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";
import { textStyles, viewStyles } from "styles/sharedComponents/customHeader";

type Props = {
  headerText: string
}

const CustomHeaderWithTranslation = ( { headerText }: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <Text style={[viewStyles.element, textStyles.text]}>{t( headerText )}</Text>
  );
};

export default CustomHeaderWithTranslation;
