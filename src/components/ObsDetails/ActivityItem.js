// @flow

import React, { useState, useEffect } from "react";
import { Text, View, Pressable } from "react-native";
import type { Node } from "react";

import UserIcon from "../SharedComponents/UserIcon";
import SmallSquareImage from "./SmallSquareImage";
import { textStyles, viewStyles } from "../../styles/obsDetails/obsDetails";
import Taxon from "../../models/Taxon";
import User from "../../models/User";
import KebabMenu from "./KebabMenu";
import { timeAgo } from "../../sharedHelpers/dateAndTime";

type Props = {
  item: Object,
  navToTaxonDetails: Function,
  handlePress: Function,
  toggleRefetch: Function
}

const ActivityItem = ( { item, navToTaxonDetails, handlePress, toggleRefetch }: Props ): Node => {
  const [currentUser, setCurrentUser] = useState( null );
  const taxon = item.taxon;
  const user = item.user;

  useEffect( ( ) => {
    const isCurrentUser = async ( ) => {
      const current = await User.isCurrentUser( user.login );
      setCurrentUser( current );
    };
    isCurrentUser( );
  }, [user] );

  return (
    <>
      <View style={[viewStyles.userProfileRow, viewStyles.rowBorder]}>
        {user && (
          <Pressable
            onPress={handlePress}
            accessibilityRole="link"
            style={viewStyles.userIcon}
            testID={`ObsDetails.identifier.${user.id}`}
          >
            <UserIcon uri={User.uri( user )} />
            <Text>{User.userHandle( user )}</Text>
          </Pressable>
        )}
        <View style={viewStyles.labels}>
          {item.vision && <Text style={textStyles.labels}>vision</Text>}
          <Text style={textStyles.labels}>{item.category}</Text>
          {item.created_at && <Text style={textStyles.labels}>{timeAgo( item.created_at )}</Text>}
          {item.body && currentUser
            ? <KebabMenu uuid={item.uuid} toggleRefetch={toggleRefetch} />
            : <Text>menu</Text>}
        </View>
      </View>
      {taxon && (
        <Pressable
          style={viewStyles.speciesDetailRow}
          onPress={navToTaxonDetails}
          accessibilityRole="link"
          accessibilityLabel="go to taxon details"
        >
          <SmallSquareImage uri={Taxon.uri( taxon )} />
          <View>
            <Text style={textStyles.commonNameText}>{taxon.preferredCommonName}</Text>
            <Text style={textStyles.scientificNameText}>{taxon.rank} {taxon.name}</Text>
          </View>
        </Pressable>
      )}
      <View style={viewStyles.speciesDetailRow}>
        <Text>{item.body}</Text>
      </View>
    </>
  );
};

export default ActivityItem;
