// @flow

import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import { Pressable, Text, View } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

import User from "../../../models/User";
import useCurrentUser from "../../../sharedHooks/useCurrentUser";
import colors from "../../../styles/colors";
import { textStyles, viewStyles } from "../../../styles/observations/userCard";
import useUser from "../../UserProfile/hooks/useUser";
import UserIcon from "../UserIcon";

const UserCard = ( ): Node => {
  const userId = useCurrentUser( );
  const { user } = useUser( userId );
  // TODO: this currently doesn't show up on initial login
  // because user id can't be fetched
  const navigation = useNavigation( );
  if ( !user ) { return <View />; }
  const navToUserProfile = ( ) => navigation.navigate( "UserProfile", { userId } );

  return (
    <View style={viewStyles.userCard}>
      <UserIcon uri={User.uri( user )} large />
      <View style={viewStyles.userDetails}>
        <Text style={textStyles.text}>{User.userHandle( user )}</Text>
        <Text style={textStyles.text}>{`${user.observations_count} Observations`}</Text>
      </View>
      <Pressable
        onPress={navToUserProfile}
        style={viewStyles.editProfile}
      >
        <IconMaterial name="edit" size={30} color={colors.white} />
      </Pressable>
    </View>
  );
};

export default UserCard;
