// @flow

import {
  Heading3
} from "components/SharedComponents";
import UserText from "components/SharedComponents/UserText.tsx";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

type Props = {
  description: string | null
}

const NotesSection = ( { description }: Props ): Node => {
  if ( !description ) return null;

  return (
    <View className="mx-4 mt-4">
      <Heading3>{t( "Notes" )}</Heading3>
      <UserText>{description}</UserText>
    </View>
  );
};

export default NotesSection;
