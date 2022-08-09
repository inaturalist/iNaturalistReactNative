// @flow

import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";

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
