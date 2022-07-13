// @flow

import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import Taxon from "../../models/Taxon";
import User from "../../models/User";
import { timeAgo } from "../../sharedHelpers/dateAndTime";
import { textStyles, viewStyles } from "../../styles/obsDetails/obsDetails";
import PlaceholderText from "../PlaceholderText";
import UserIcon from "../SharedComponents/UserIcon";
import KebabMenu from "./KebabMenu";
import SmallSquareImage from "./SmallSquareImage";

type Props = {
  item: Object,
  navToTaxonDetails: Function,
  handlePress: Function,
  toggleRefetch: Function
}

const ActivityItem = ( {
  item, navToTaxonDetails, handlePress, toggleRefetch
}: Props ): Node => {
  const [currentUser, setCurrentUser] = useState( null );
  const { taxon } = item;
  const { user } = item;

  useEffect( ( ) => {
    const isCurrentUser = async ( ) => {
      const current = await User.isCurrentUser( user.login );
      setCurrentUser( current );
    };
    isCurrentUser( );
  }, [user] );

  return (
    <View style={[item.temporary ? viewStyles.temporaryRow : null]}>
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
          {item.vision && <PlaceholderText style={[textStyles.labels]} text="vision" />}
          <Text style={textStyles.labels}>{item.category}</Text>
          {item.created_at && <Text style={textStyles.labels}>{timeAgo( item.created_at )}</Text>}
          {item.body && currentUser
            ? <KebabMenu uuid={item.uuid} toggleRefetch={toggleRefetch} />
            : <PlaceholderText text="menu" />}
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
            <Text style={textStyles.scientificNameText}>
              {taxon.rank}
              {" "}
              {taxon.name}
            </Text>
          </View>
        </Pressable>
      )}
      <View style={viewStyles.speciesDetailRow}>
        <Text>{item.body}</Text>
      </View>
    </View>
  );
};

export default ActivityItem;
