// @flow

import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import User from "realmModels/User";
import useCurrentUser from "sharedHooks/useCurrentUser";

const UserCard = ( ): Node => {
  const currentUser = useCurrentUser( );
  const { t } = useTranslation( );

  return (
    <View className="flex-row px-5 items-center rounded-bl-3xl rounded-br-3xl bg-white h-24">
      <View className="ml-3">
        <Text className="mt-1 text-3xl font-light">{t( "Welcome back," )}</Text>
        <Text className="mb-1 text-3xl font-semibold">{User.userHandle( currentUser )}</Text>
      </View>
    </View>
  );
};

export default UserCard;
