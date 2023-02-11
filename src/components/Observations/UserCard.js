// @flow

import { Body1 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Trans } from "react-i18next";
import User from "realmModels/User";
import useCurrentUser from "sharedHooks/useCurrentUser";

const UserCard = ( ): Node => {
  const currentUser = useCurrentUser( );

  return (
    <View className="flex-row px-5 items-center bg-white h-24 ml-3">
      <Trans
        i18nKey="Welcome-user"
        values={{ userHandle: User.userHandle( currentUser ) }}
        parent={View}
        components={[
          <Body1 className="mt-1 text-3xl" />,
          <Body1 className="mb-1 text-3xl font-semibold" />
        ]}
      />
    </View>
  );
};

export default UserCard;
