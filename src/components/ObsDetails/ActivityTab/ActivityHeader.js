// @flow
import classnames from "classnames";
import ActivityHeaderKebabMenu from "components/ObsDetails/ActivityTab/ActivityHeaderKebabMenu";
import WithdrawIDSheet from "components/ObsDetails/Sheets/WithdrawIDSheet";
import {
  ActivityIndicator,
  Body4, INatIcon, InlineUser, TextInputSheet, WarningSheet
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import { formatIdDate } from "sharedHelpers/dateAndTime";
import colors from "styles/tailwindColors";

type Props = {
  classNameMargin?: string,
  currentUser: boolean,
  deleteComment: any,
  flagged: boolean,
  idWithdrawn?: boolean,
  isOnline?: boolean,
  item: any,
  loading: boolean,
  updateCommentBody: any,
  updateIdentification: any
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
  updateIdentification
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
      let categoryText;
      switch ( category ) {
        case "improving":
          categoryText = t( "improving--identification" );
          break;
        case "maverick":
          categoryText = t( "maverick--identification" );
          break;
        case "leading":
          categoryText = t( "leading--identification" );
          break;
        default:
          categoryText = t( "supporting--identification" );
      }
      return (
        <Body4>
          { categoryText }
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
      <View className="flex-row items-center space-x-[15px] -mr-[15px]">
        {renderIcon()}
        {renderStatus()}
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
                setShowWithdrawIDSheet={setShowWithdrawIDSheet}
                updateIdentification={updateIdentification}
                setShowEditCommentSheet={setShowEditCommentSheet}
                setShowDeleteCommentSheet={setShowDeleteCommentSheet}
              />
            )
        }
        {( currentUser && showWithdrawIDSheet ) && (
          <WithdrawIDSheet
            handleClose={() => setShowWithdrawIDSheet( false )}
            taxon={item.taxon}
            updateIdentification={updateIdentification}
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
            headerText={t( "DELETE-COMMENT--question" )}
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
