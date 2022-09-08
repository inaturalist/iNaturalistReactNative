// @flow

import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";

type Props = {
  text: string,
  style?: any,
  className?: string,
  count?: number
}

const TranslatedText = ( {
  text, style, className, count
}: Props ): Node => {
  const { t } = useTranslation( );

  // $FlowIgnore
  return <Text className={className} style={style}>{t( text, { count } )}</Text>;
};

export default TranslatedText;
