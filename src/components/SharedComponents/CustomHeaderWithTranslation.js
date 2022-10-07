// @flow

import { Text } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  headerText: string
}

const CustomHeaderWithTranslation = ( { headerText }: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <Text className="text-2xl">{t( headerText )}</Text>
  );
};

export default CustomHeaderWithTranslation;
