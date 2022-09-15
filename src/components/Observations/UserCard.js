// @flow

import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import User from "../../models/User";
import useCurrentUser from "../../sharedHooks/useCurrentUser";
import { viewStyles } from "../../styles/observations/userCard";
import TranslatedText from "../SharedComponents/TranslatedText";
import UserIcon from "../SharedComponents/UserIcon";
import useRemoteUser from "../UserProfile/hooks/useRemoteUser";

const UserCard = ( ): Node => {
  const user = useCurrentUser( );
  const { user: remoteUser } = useRemoteUser( user?.id );
  // TODO: this currently doesn't show up on initial login
  // because user id can't be fetched
  const navigation = useNavigation( );
  if ( !user ) { return <View style={viewStyles.topCard} />; }
  const navToUserProfile = ( ) => navigation.navigate( "UserProfile", { user: user.id } );

  return (
    <View style={viewStyles.userCard}>
      <UserIcon uri={{ uri: remoteUser?.icon_url }} large />
      <View style={viewStyles.userDetails}>
        <Text>{User.userHandle( user )}</Text>
        <TranslatedText text="X-Observations" count={user.observations_count || 0} />
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
