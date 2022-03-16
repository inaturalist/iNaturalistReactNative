// @flow

import React from "react";
import { Text } from "react-native";
import type { Node } from "react";
import { useTranslation } from "react-i18next";

import { viewStyles, textStyles } from "../../styles/sharedComponents/customHeader";

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
