// @flow

import { useQueryClient } from "@tanstack/react-query";
import { deleteComments } from "api/comments";
import INatIcon from "components/INatIcon";
import { isCurrentUser } from "components/LoginSignUp/AuthenticationService";
import FlagItemModal from "components/ObsDetails/FlagItemModal";
import {
  Body4,
  InlineUser
} from "components/SharedComponents";
import DateDisplay from "components/SharedComponents/DateDisplay";
import KebabMenu from "components/SharedComponents/KebabMenu";
import {
  Text, View
} from "components/styledComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Menu } from "react-native-paper";
import Comment from "realmModels/Comment";
import { formatIdDate } from "sharedHelpers/dateAndTime";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import colors from "styles/tailwindColors";

const { useRealm } = RealmContext;

type Props = {
  item: Object,
  refetchRemoteObservation?: Function,
  toggleRefetch?: Function,
}

const ActivityHeader = ( { item, refetchRemoteObservation, toggleRefetch }:Props ): Node => {
  const [currentUser, setCurrentUser] = useState( null );
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const [flagModalVisible, setFlagModalVisible] = useState( false );
  const [flaggedStatus, setFlaggedStatus] = useState( false );
  const realm = useRealm( );
  const queryClient = useQueryClient( );
  const { user } = item;
  const itemType = item.category ? "Identification" : "Comment";

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

  const closeFlagItemModal = () => {
    setFlagModalVisible( false );
  };

  const onItemFlagged = () => {
    if ( refetchRemoteObservation ) {
      setFlaggedStatus( true );
      refetchRemoteObservation();
    }
  };

  const deleteCommentMutation = useAuthenticatedMutation(
    ( uuid, optsWithAuth ) => deleteComments( uuid, optsWithAuth ),
    {
      onSuccess: ( ) => {
        queryClient.invalidateQueries( ["fetchRemoteObservation", item.uuid] );
        if ( refetchRemoteObservation ) {
          refetchRemoteObservation( );
        }
      }
    }
  );

  const renderIcon = () => {
    if ( item.vision ) return <INatIcon name="cv" size={22} />;
    if ( flaggedStatus ) return <INatIcon name="flag" color={colors.warningYellow} size={22} />;
    return null;
  };

  const ifCommentOrID = () => (
    <View className="flex-row items-center space-x-[15px]">
      {renderIcon()}
      {
            flaggedStatus
              ? (
                <Body4>
                  {t( "Flagged" )}
                </Body4>
              )
              : (
                <Body4>
                  {item.category ? t( `Category-${item.category}` ) : ""}
                </Body4>
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
                if ( toggleRefetch ) {
                  toggleRefetch( );
                }
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

  return (
    <View className="flex-row ml-4 justify-between">
      <InlineUser user={user} />
      {( item._created_at )
        ? <DateDisplay dateTime={item._created_at} />
        : ifCommentOrID()}
    </View>
  );
};

export default ActivityHeader;
