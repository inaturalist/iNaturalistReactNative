// @flow

import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";

type Props = {
  text: string,
  textStyle?: string,
  count?: number
}

const TranslatedText = ( { text, textStyle, count }: Props ): Node => {
  const { t } = useTranslation( );

  return <Text className={textStyle}>{t( text, { count } )}</Text>;
};

export default TranslatedText;
