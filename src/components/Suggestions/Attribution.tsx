import {
  Body3,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import {
  useTranslation,
} from "sharedHooks";

interface Props {
  observers: string[];
}

const Attribution = ( {
  observers,
}: Props ) => {
  const { t } = useTranslation( );

  if ( !observers || observers?.length === 0 ) {
    return <View testID="Attribution.empty" />;
  }

  return (
    <Body3 className="mx-4">
      {t( "iNaturalist-identification-suggestions-are-based-on", {
        user1: observers[0],
        user2: observers[1],
        user3: observers[2],
      } )}
    </Body3>
  );
};

export default Attribution;
