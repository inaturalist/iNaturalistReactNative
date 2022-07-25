// @flow

import React, { useState, useEffect } from "react";
import {Text, View, Pressable, Image} from "react-native";
import type { Node } from "react";

import UserIcon from "../SharedComponents/UserIcon";
import SmallSquareImage from "./SmallSquareImage";
import { textStyles, viewStyles, imageStyles } from "../../styles/obsDetails/obsDetails";
import Taxon from "../../models/Taxon";
import User from "../../models/User";
import {formatIdDate} from "../../sharedHelpers/dateAndTime";
import {Button} from "react-native-paper";
import {colors} from "../../styles/global";
import {useTranslation} from "react-i18next";

type Props = {
  item: Object,
  navToTaxonDetails: Function,
  handlePress: Function,
  toggleRefetch: Function
}

const ActivityItem = ( { item, navToTaxonDetails, handlePress, toggleRefetch }: Props ): Node => {
  const { t } = useTranslation( );
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
    <View style={[viewStyles.activityItem, item.temporary ? viewStyles.temporaryRow : null]}>
      <View style={[viewStyles.userProfileRow, viewStyles.rowBorder]}>
        {user && (
          <Pressable
            onPress={handlePress}
            accessibilityRole="link"
            style={viewStyles.userIcon}
            testID={`ObsDetails.identifier.${user.id}`}
          >
            <UserIcon uri={User.uri( user )} />
            <Text style={textStyles.username}>{User.userHandle( user )}</Text>
          </Pressable>
        )}
        <View style={viewStyles.labelsContainer}>
          {item.vision && <Image style={imageStyles.smallGreenIcon} source={require( "../../images/id_rg.png" )} />}
          <Text style={[textStyles.labels, textStyles.activityCategory]}>{item.category ? t( `Category-${item.category}` ) : ""}</Text>
          {item.created_at && <Text style={textStyles.labels}>{formatIdDate( item.updated_at || item.created_at, t )}</Text>}
          {item.body && currentUser
            ? <View style={viewStyles.kebabMenuIconContainer}><Button icon="dots-horizontal" textColor={colors.logInGray} style={viewStyles.kebabMenuIcon}/></View>
            : <View style={viewStyles.kebabMenuIconContainer}><Button icon="dots-horizontal" textColor={colors.logInGray} style={viewStyles.kebabMenuIcon}/></View>
          }
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
            <Text style={textStyles.commonNameText}>{taxon.preferred_common_name}</Text>
            <Text style={textStyles.scientificNameText}>{taxon.rank} {taxon.name}</Text>
          </View>
        </Pressable>
      )}
      <View style={viewStyles.speciesDetailRow}>
        <Text style={textStyles.activityItemBody}>{item.body}</Text>
      </View>
    </View>
  );
};

export default ActivityItem;
