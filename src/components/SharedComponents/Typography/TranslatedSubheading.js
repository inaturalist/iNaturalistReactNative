// @flow

import React from "react";
import { Subheading } from "react-native-paper";
import type { Node } from "react";

import { useTranslation } from "react-i18next";

type Props = {
  text: string,
  style?: Object,
  count?: number
}

const TranslatedSubheading = ( { text, style, count }: Props ): Node => {
  const { t } = useTranslation( );

  return <Subheading style={style}>{t( text, { count } )}</Subheading>;
};

export default TranslatedSubheading;
