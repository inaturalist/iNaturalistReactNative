// @flow

import * as React from "react";
import { Text, View, Pressable } from "react-native";

import UserIcon from "../SharedComponents/UserIcon";
import SmallSquareImage from "./SmallSquareImage";
import { textStyles, viewStyles } from "../../styles/obsDetails";
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

  return (
    <>
      <View style={[viewStyles.userProfileRow, viewStyles.rowBorder]}>
        <Pressable
          onPress={handlePress}
          accessibilityRole="link"
          style={viewStyles.userProfileRow}
          testID={`ObsDetails.identifier.${item.user.id}`}
        >
          <UserIcon uri={User.uri( item.user )} />
          <Text>{User.userHandle( item.user )}</Text>
        </Pressable>
        {item.vision && <Text>vision</Text>}
        <Text>{item.category}</Text>
        {item.created_at && <Text>{timeAgo( item.created_at )}</Text>}
        <FlagDropdown id={item} />
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
