import {
  Heading3,
} from "components/SharedComponents";
import UserText from "components/SharedComponents/UserText";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React from "react";

interface Props {
  description: string | null;
}

const NotesSection = ( { description }: Props ) => {
  if ( !description ) return null;

  return (
    <View className="mx-4 mt-4">
      <Heading3>{t( "Notes" )}</Heading3>
      <UserText>{description}</UserText>
    </View>
  );
};

export default NotesSection;
