// @flow

import { useQueryClient } from "@tanstack/react-query";
import { deleteComments } from "api/comments";
import { isCurrentUser } from "components/LoginSignUp/AuthenticationService";
import FlagItemModal from "components/ObsDetails/FlagItemModal";
import InlineUser from "components/SharedComponents/InlineUser";
import KebabMenu from "components/SharedComponents/KebabMenu";
import UserText from "components/SharedComponents/UserText";
import {
  Image,
  Pressable, Text, View
} from "components/styledComponents";
import { t } from "i18next";
import _ from "lodash";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Menu } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Comment from "realmModels/Comment";
import Taxon from "realmModels/Taxon";
import { formatIdDate } from "sharedHelpers/dateAndTime";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import useIsConnected from "sharedHooks/useIsConnected";
import { textStyles } from "styles/obsDetails/obsDetails";

import TaxonImage from "./TaxonImage";

const { useRealm } = RealmContext;

type Props = {
  item: Object,
  navToTaxonDetails: Function,
  toggleRefetch: Function,
  refetchRemoteObservation: Function
}

const ActivityItem = ( {
  item, navToTaxonDetails, toggleRefetch, refetchRemoteObservation
}: Props ): Node => {
  const [currentUser, setCurrentUser] = useState( null );
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const [flagModalVisible, setFlagModalVisible] = useState( false );
  const [flaggedStatus, setFlaggedStatus] = useState( false );
  const { taxon } = item;
  const { user } = item;

  const realm = useRealm( );
  const queryClient = useQueryClient( );
  const itemType = item.category ? "Identification" : "Comment";
  const activityItemClassName = flaggedStatus
    ? "flex-row border border-borderGray py-1 justify-between bg-flaggedBackground"
    : "flex-row border border-borderGray py-1 justify-between";
  const isOnline = useIsConnected( );

  useEffect( ( ) => {
    const isActiveUserTheCurrentUser = async ( ) => {
      const current = await isCurrentUser( user?.login );
      setCurrentUser( current );
    };
    isActiveUserTheCurrentUser( );

    // show flagged activity item right after flag item modal closes
    if ( item.flags?.length > 0 ) {
      setFlaggedStatus( true );
    }
  }, [user, item] );

  const deleteCommentMutation = useAuthenticatedMutation(
    ( uuid, optsWithAuth ) => deleteComments( uuid, optsWithAuth ),
    {
      onSuccess: ( ) => {
        queryClient.invalidateQueries( ["fetchRemoteObservation", item.uuid] );
        refetchRemoteObservation( );
      }
    }
  );

  const closeFlagItemModal = () => {
    setFlagModalVisible( false );
  };

  const onItemFlagged = () => {
    setFlaggedStatus( true );
    refetchRemoteObservation();
  };

  const showNoInternetIcon = accessibilityLabel => (
    <View className="mr-3">
      <IconMaterial
        name="wifi-off"
        size={30}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );

  return (
    <View className={item.temporary && "opacity-50"}>
      <View className={activityItemClassName}>
        {user && <InlineUser user={user} />}
        <View className="flex-row items-center">
          {item.vision
            && (
            <Image
              className="w-6 h-6"
              source={require( "images/id_rg.png" )}
            />
            )}
          {
              flaggedStatus
                ? (
                  <Text className="color-flaggedText mr-2">
                    {t( "Flagged" )}
                  </Text>
                )
                : (
                  <Text className="color-inatGreen mr-2">
                    {item.category ? t( `Category-${item.category}` ) : ""}
                  </Text>
                )
            }
          {item.created_at
            && (
            <Text>
              {formatIdDate( item.updated_at || item.created_at, t )}
            </Text>
            )}
          {item.body && currentUser
            ? (
              <KebabMenu
                visible={kebabMenuVisible}
                setVisible={setKebabMenuVisible}
              >
                <Menu.Item
                  onPress={async ( ) => {
                    // first delete locally
                    Comment.deleteComment( item.uuid, realm );
                    // then delete remotely
                    deleteCommentMutation.mutate( item.uuid );
                    toggleRefetch( );
                    setKebabMenuVisible( false );
                  }}
                  title={t( "Delete-comment" )}
                />
              </KebabMenu>
            ) : (
              <KebabMenu
                visible={kebabMenuVisible}
                setVisible={setKebabMenuVisible}
              >
                {!currentUser ? (
                  <Menu.Item
                    onPress={() => setFlagModalVisible( true )}
                    title={t( "Flag" )}
                    testID="MenuItem.Flag"
                  />
                ) : undefined}
                <View />
              </KebabMenu>
            )}
        </View>
      </View>
      {taxon && (
        <Pressable
          className="flex-row my-3 ml-3 items-center"
          onPress={navToTaxonDetails}
          accessibilityRole="link"
          accessibilityLabel={t( "Navigate-to-taxon-details" )}
        >
          {isOnline
            ? <TaxonImage uri={Taxon.uri( taxon )} />
            : showNoInternetIcon( t( "Taxon-photo-unavailable-without-internet" ) )}
          <View>
            <Text className="text-lg">{taxon.preferred_common_name}</Text>
            <Text className="color-logInGray">
              {taxon.rank}
              {" "}
              {taxon.name}
            </Text>
          </View>
        </Pressable>
      )}
      { !_.isEmpty( item?.body ) && (
        <View className="flex-row my-3 ml-3">
          <UserText baseStyle={textStyles.activityItemBody} text={item.body} />
        </View>
      )}
      {!currentUser
        && (
        <FlagItemModal
          id={item.id}
          showFlagItemModal={flagModalVisible}
          closeFlagItemModal={closeFlagItemModal}
          itemType={itemType}
          onItemFlagged={onItemFlagged}
        />
        )}
    </View>
  );
};

export default ActivityItem;
