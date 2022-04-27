// @flow

import React from "react";
import { Headline } from "react-native-paper";
import type { Node } from "react";

import { useTranslation } from "react-i18next";

type Props = {
  text: string,
  style?: Object,
  count?: number
}

const TranslatedHeadline = ( { text, style, count }: Props ): Node => {
  const { t } = useTranslation( );

  return <Headline style={style}>{t( text, { count } )}</Headline>;
};

export default TranslatedHeadline;
