// @flow

import { Body1 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import User from "realmModels/User";
import useCurrentUser from "sharedHooks/useCurrentUser";

const UserCard = ( ): Node => {
  const currentUser = useCurrentUser( );
  useTranslation( );

  return (
    <View className="flex-row px-5 items-center bg-white h-24 ml-3">
      <Trans
        i18nKey="Welcome-user"
        parent={View}
        values={{ userHandle: User.userHandle( currentUser ) }}
        components={[
          <Body1 className="mt-1 text-3xl" />,
          <Body1 className="mb-1 text-3xl font-semibold" />
        ]}
      />
    </View>
  );
};

export default UserCard;
