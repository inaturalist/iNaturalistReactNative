// @flow

import { Heading1, Subheading1 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import User from "realmModels/User";
import useCurrentUser from "sharedHooks/useCurrentUser";

const UserCard = ( ): Node => {
  const currentUser = useCurrentUser( );
  // useTranslation fixes unit test.
  useTranslation( );

  return (
    <View className="px-5 bg-white">
      <Trans
        i18nKey="Welcome-user"
        parent={View}
        values={{ userHandle: User.userHandle( currentUser ) }}
        components={[
          <Subheading1 className="mt-5" />,
          <Heading1 />
        ]}
      />
    </View>
  );
};

export default UserCard;
