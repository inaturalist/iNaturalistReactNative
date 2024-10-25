import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useEffect } from "react";

import UserList from "./UserList";

const UserListContainer = ( ) => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { users, headerOptions } = params;

  useEffect( ( ) => {
    navigation.setOptions( headerOptions );
  }, [headerOptions, navigation] );

  return (
    <ViewWrapper>
      <View className="border-b border-lightGray mt-5" />
      <UserList users={users} />
    </ViewWrapper>
  );
};

export default UserListContainer;
