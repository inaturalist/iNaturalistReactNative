// @flow
import classnames from "classnames";
import ActivityHeaderKebabMenu from "components/ObsDetails/ActivityTab/ActivityHeaderKebabMenu";
import WithdrawIDSheet from "components/ObsDetails/Sheets/WithdrawIDSheet";
import {
  Body4, INatIcon, InlineUser, TextInputSheet, WarningSheet
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
import { formatIdDate } from "sharedHelpers/dateAndTime";
import colors from "styles/tailwindColors";

type Props = {
  classNameMargin?: string,
  currentUser: boolean,
  deleteComment: Function,
  flagged: boolean,
  idWithdrawn: boolean,
  isOnline: boolean,
  item: Object,
  loading: boolean,
  updateCommentBody: Function,
  withdrawOrRestoreIdentification: Function
}

const ActivityHeader = ( {
  classNameMargin,
  currentUser,
  deleteComment,
  flagged,
  idWithdrawn,
  isOnline,
  item,
  loading,
  updateCommentBody,
  withdrawOrRestoreIdentification
}:Props ): Node => {
  const [showEditCommentSheet, setShowEditCommentSheet] = useState( false );
  const [showDeleteCommentSheet, setShowDeleteCommentSheet] = useState( false );
  const [showWithdrawIDSheet, setShowWithdrawIDSheet] = useState( false );
  const { user, vision } = item;
  const { category } = user || {};

  const itemType = item.category
    ? "Identification"
    : "Comment";

  const renderIcon = useCallback( () => {
    if ( idWithdrawn ) {
      return (
        <View className="opacity-50">
          <INatIcon name="ban" color={colors.primary} size={22} />
        </View>
      );
    }

    if ( vision ) return <INatIcon name="sparkly-label" size={22} />;
    if ( flagged ) return <INatIcon name="flag" color={colors.warningYellow} size={22} />;
    return null;
  }, [
    flagged,
    idWithdrawn,
    vision
  ] );

  const renderStatus = useCallback( () => {
    if ( flagged ) {
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
    if ( category ) {
      return (
        <Body4>
          { t( `Category-${category}` )}
        </Body4>
      );
    }
    return (
      <Body4 />
    );
  }, [
    category,
    flagged,
    idWithdrawn
  ] );

  return (
    <View className={classnames( "flex-row justify-between h-[26px] my-[11px]", classNameMargin )}>
      <InlineUser user={user} isOnline={isOnline} />
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
        {
          loading
            ? (
              <View className="mr-[20px]">
                <ActivityIndicator size={10} />
              </View>
            )
            : (
              <ActivityHeaderKebabMenu
                currentUser={currentUser}
                itemType={itemType}
                current={item.current}
                itemBody={item.body}
                setShowWithdrawIDSheet={setShowWithdrawIDSheet}
                withdrawOrRestoreIdentification={withdrawOrRestoreIdentification}
                setShowEditCommentSheet={setShowEditCommentSheet}
                setShowDeleteCommentSheet={setShowDeleteCommentSheet}
              />
            )
        }
        {( currentUser && showWithdrawIDSheet ) && (
          <WithdrawIDSheet
            handleClose={() => setShowWithdrawIDSheet( false )}
            taxon={item.taxon}
            withdrawOrRestoreIdentification={withdrawOrRestoreIdentification}
          />
        )}

        {( currentUser && showEditCommentSheet ) && (
          <TextInputSheet
            handleClose={() => setShowEditCommentSheet( false )}
            headerText={t( "EDIT-COMMENT" )}
            initialInput={item.body}
            confirm={textInput => updateCommentBody( textInput )}
          />
        )}
        {( currentUser && showDeleteCommentSheet ) && (
          <WarningSheet
            handleClose={( ) => setShowDeleteCommentSheet( false )}
            headerText={t( "DELETE-COMMENT-QUESTION" )}
            confirm={deleteComment}
            buttonText={t( "DELETE" )}
            handleSecondButtonPress={( ) => setShowDeleteCommentSheet( false )}
            secondButtonText={t( "CANCEL" )}
          />
        )}
      </View>
    </View>
  );
};

export default ActivityHeader;
