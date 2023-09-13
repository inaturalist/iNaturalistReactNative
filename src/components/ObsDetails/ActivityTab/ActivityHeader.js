// @flow

import { useQueryClient } from "@tanstack/react-query";
import { deleteComments, updateComment } from "api/comments";
import { updateIdentification } from "api/identifications";
import classnames from "classnames";
import { isCurrentUser } from "components/LoginSignUp/AuthenticationService";
import FlagItemModal from "components/ObsDetails/FlagItemModal";
import {
  Body4, INatIcon, InlineUser, TextInputSheet
} from "components/SharedComponents";
import KebabMenu from "components/SharedComponents/KebabMenu";
import {
  View
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
  classNameMargin?: string,
  idWithdrawn: boolean
}

const ActivityHeader = ( {
  item, refetchRemoteObservation, classNameMargin,
  idWithdrawn
}:Props ): Node => {
  const [currentUser, setCurrentUser] = useState( null );
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const [flagModalVisible, setFlagModalVisible] = useState( false );
  const [flaggedStatus, setFlaggedStatus] = useState( false );
  const realm = useRealm( );
  const queryClient = useQueryClient( );
  const [showEditCommentSheet, setShowEditCommentSheet] = useState( false );
  const { user } = item;

  const itemType = item.category
    ? "Identification"
    : "Comment";

  useEffect( ( ) => {
    const isActiveUserTheCurrentUser = async ( ) => {
      const current = await isCurrentUser( user?.login );
      setCurrentUser( current );
    };
    isActiveUserTheCurrentUser( );

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

  const updateCommentMutation = useAuthenticatedMutation(
    ( uuid, optsWithAuth ) => updateComment( uuid, optsWithAuth ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries( ["fetchRemoteObservation", item.uuid] );
        if ( refetchRemoteObservation ) {
          refetchRemoteObservation( );
        }
      }
    }
  );

  const updateCommentBody = comment => {
    const updateCommentParams = {
      id: item.uuid,
      comment: {
        body: comment
      }
    };
    updateCommentMutation.mutate( updateCommentParams );
  };

  const updateIdentificationMutation = useAuthenticatedMutation(
    ( uuid, optsWithAuth ) => updateIdentification( uuid, optsWithAuth ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries( ["fetchRemoteObservation", item.uuid] );
        if ( refetchRemoteObservation ) {
          refetchRemoteObservation( );
        }
      }
    }
  );

  const withdrawOrRestoreIdentification = withdrawOrRestore => {
    const updateIdentificationParams = {
      id: item.uuid,
      identification: {
        body: item.body,
        current: withdrawOrRestore
      }
    };
    updateIdentificationMutation.mutate( updateIdentificationParams );
  };

  const renderIcon = () => {
    if ( idWithdrawn ) {
      return (
        <View className="opacity-50">
          <INatIcon name="ban" color={colors.primary} size={22} />
        </View>
      );
    }
    if ( item.vision ) return <INatIcon name="sparkly-label" size={22} />;
    if ( flaggedStatus ) return <INatIcon name="flag" color={colors.warningYellow} size={22} />;
    return null;
  };

  const renderStatus = () => {
    if ( flaggedStatus ) {
      return (
        <Body4>
          {t( "Flagged" )}
        </Body4>
      );
    }
    if ( idWithdrawn ) {
      return (
        <Body4>
          { t( "ID-Withdrawn" )}
        </Body4>
      );
    }
    if ( item.category ) {
      return (
        <Body4>
          { t( `Category-${item.category}` )}
        </Body4>
      );
    }
    return (
      <Body4 />
    );
  };

  return (
    <View className={classnames( "flex-row justify-between", classNameMargin )}>
      <InlineUser user={user} />
      <View className="flex-row items-center space-x-[15px]">
        {renderIcon()}
        {
          renderStatus()
        }
        {item.created_at
            && (
              <Body4>
                {formatIdDate( item.updated_at || item.created_at, t )}
              </Body4>
            )}
        {( itemType === "Identification" && currentUser )
          && (
            <KebabMenu
              visible={kebabMenuVisible}
              setVisible={setKebabMenuVisible}
            >
              {item.current === true
                ? (
                  <Menu.Item
                    onPress={async ( ) => {
                      withdrawOrRestoreIdentification( false );
                      setKebabMenuVisible( false );
                      // // first delete locally
                      //   Comment.deleteComment( item.uuid, realm );
                      //   // then delete remotely
                      //   deleteCommentMutation.mutate( item.uuid );
                      //   setKebabMenuVisible( false );
                    }}
                    title={t( "Withdraw" )}
                  />
                )
                : (
                  <Menu.Item
                    onPress={async ( ) => {
                      withdrawOrRestoreIdentification( true );
                      setKebabMenuVisible( false );
                      // // first delete locally
                      //   Comment.deleteComment( item.uuid, realm );
                      //   // then delete remotely
                      //   deleteCommentMutation.mutate( item.uuid );
                      //   setKebabMenuVisible( false );
                    }}
                    title={t( "Restore" )}
                  />
                )}
            </KebabMenu>
          )}
        {
          ( item.body && currentUser )
            && (
              <KebabMenu
                visible={kebabMenuVisible}
                setVisible={setKebabMenuVisible}
              >
                <Menu.Item
                  onPress={async ( ) => {
                    setShowEditCommentSheet( true );
                    setKebabMenuVisible( false );
                    // // first delete locally
                    // update realm with edited comments?
                  }}
                  title={t( "Edit-comment" )}
                />
                <Menu.Item
                  onPress={async ( ) => {
                  // first delete locally
                    Comment.deleteComment( item.uuid, realm );
                    // then delete remotely
                    deleteCommentMutation.mutate( item.uuid );
                    setKebabMenuVisible( false );
                  }}
                  title={t( "Delete-comment" )}
                />
              </KebabMenu>
            )
        }
        {
          !currentUser
          && (
            <KebabMenu
              visible={kebabMenuVisible}
              setVisible={setKebabMenuVisible}
            >
              {!currentUser
                ? (
                  <Menu.Item
                    onPress={() => setFlagModalVisible( true )}
                    title={t( "Flag" )}
                    testID="MenuItem.Flag"
                  />
                )
                : undefined}
              <View />
            </KebabMenu>
          )
        }

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
        {( currentUser && showEditCommentSheet ) && (
          <TextInputSheet
            handleClose={() => setShowEditCommentSheet( false )}
            headerText={t( "EDIT-COMMENT" )}
            initialInput={item.body}
            snapPoints={[416]}
            confirm={textInput => updateCommentBody( textInput )}
          />
        )}
      </View>
    </View>
  );
};

export default ActivityHeader;
