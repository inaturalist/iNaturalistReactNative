// @flow

import * as React from "react";
import { Text, View, Pressable } from "react-native";

import UserIcon from "../SharedComponents/UserIcon";
import SmallSquareImage from "./SmallSquareImage";
import { textStyles, viewStyles } from "../../styles/obsDetails/obsDetails";
import Taxon from "../../models/Taxon";
import User from "../../models/User";
import FlagDropdown from "./FlagDropdown";
import { timeAgo } from "../../sharedHelpers/dateAndTime";

type Props = {
  item: Object,
  navToTaxonDetails: Function,
  handlePress: Function
}

const ActivityItem = ( { item, navToTaxonDetails, handlePress }: Props ): React.Node => {
  const taxon = item.taxon;
  const user = item.user;

  return (
    <View style={[item.temporary ? viewStyles.temporaryRow : null]}>
      <View style={[viewStyles.userProfileRow, viewStyles.rowBorder]}>
        {user && (
          <Pressable
            onPress={handlePress}
            accessibilityRole="link"
            style={viewStyles.userProfileRow}
            testID={`ObsDetails.identifier.${user.id}`}
          >
            <UserIcon uri={User.uri( user )} />
            <Text>{User.userHandle( user )}</Text>
          </Pressable>
        )}
        {item.vision && <Text>vision</Text>}
        <Text>{item.category}</Text>
        {item.created_at && <Text>{timeAgo( item.created_at )}</Text>}
        <FlagDropdown />
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
    </View>
  );
};

export default ActivityItem;
