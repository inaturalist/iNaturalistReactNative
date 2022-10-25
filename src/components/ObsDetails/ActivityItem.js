// @flow

import { isCurrentUser } from "components/LoginSignUp/AuthenticationService";
import PlaceholderText from "components/PlaceholderText";
import KebabMenu from "components/SharedComponents/KebabMenu";
import UserIcon from "components/SharedComponents/UserIcon";
import { t } from "i18next";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import {
  Image, Pressable, Text, View
} from "react-native";
import { Menu } from "react-native-paper";
import Comment from "realmModels/Comment";
import Taxon from "realmModels/Taxon";
import User from "realmModels/User";
import { formatIdDate } from "sharedHelpers/dateAndTime";
import useApiToken from "sharedHooks/useApiToken";
import { imageStyles, textStyles, viewStyles } from "styles/obsDetails/obsDetails";

import SmallSquareImage from "./SmallSquareImage";

const { useRealm } = RealmContext;

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
  const apiToken = useApiToken( );

  const realm = useRealm( );

  useEffect( ( ) => {
    const isActiveUserTheCurrentUser = async ( ) => {
      const current = await isCurrentUser( user.login );
      setCurrentUser( current );
    };
    isActiveUserTheCurrentUser( );
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
          {item.vision
            && (
            <Image
              style={imageStyles.smallGreenIcon}
              source={require( "images/id_rg.png" )}
            />
            )}
          <Text style={[textStyles.labels, textStyles.activityCategory]}>
            {item.category ? t( `Category-${item.category}` ) : ""}
          </Text>
          {item.created_at
            && (
            <Text style={textStyles.labels}>
              {formatIdDate( item.updated_at || item.created_at, t )}
            </Text>
            )}
          {item.body && currentUser
            ? (
              <KebabMenu>
                <Menu.Item
                  onPress={async ( ) => {
                    Comment.deleteComment( item.uuid, realm, apiToken );
                    toggleRefetch( );
                  }}
                  title={t( "Delete-comment" )}
                />
              </KebabMenu>
            ) : <PlaceholderText text="menu" />}
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
            <Text style={textStyles.scientificNameText}>
              {taxon.rank}
              {" "}
              {taxon.name}
            </Text>
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
