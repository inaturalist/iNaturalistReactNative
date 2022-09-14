// @flow

import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import User from "../../models/User";
import useCurrentUser from "../../sharedHooks/useCurrentUser";
import { viewStyles } from "../../styles/observations/userCard";
import UserIcon from "../SharedComponents/UserIcon";
import useUser from "../UserProfile/hooks/useUser";

const UserCard = ( ): Node => {
  const userId = useCurrentUser( );
  const { user } = useUser( userId );
  // TODO: this currently doesn't show up on initial login
  // because user id can't be fetched
  const navigation = useNavigation( );
  if ( !user ) { return <View style={viewStyles.topCard} />; }
  const navToUserProfile = ( ) => navigation.navigate( "UserProfile", { userId } );

  return (
    <View style={viewStyles.userCard}>
      <UserIcon uri={User.uri( user )} large />
      <View style={viewStyles.userDetails}>
        <Text>{User.userHandle( user )}</Text>
        <Text>{`${user.observations_count} Observations`}</Text>
      </View>
      <Pressable
        onPress={navToUserProfile}
        style={viewStyles.editProfile}
      >
        <Icon name="pencil" size={30} />
      </Pressable>
    </View>
  );
};

export default UserCard;
