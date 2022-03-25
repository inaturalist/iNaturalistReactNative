// @flow

import React from "react";
import { Text } from "react-native";
import type { Node } from "react";

import { useTranslation } from "react-i18next";

type Props = {
  text: string,
  style?: Object,
  count?: number
}

const TranslatedText = ( { text, style, count }: Props ): Node => {
  const { t } = useTranslation( );

  return <Text style={style}>{t( text, { count } )}</Text>;
};

export default TranslatedText;
