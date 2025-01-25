// @flow
import classnames from "classnames";
import ActivityHeaderKebabMenu from "components/ObsDetails/ActivityTab/ActivityHeaderKebabMenu";
import WithdrawIDSheet from "components/ObsDetails/Sheets/WithdrawIDSheet";
import {
  ActivityIndicator,
  Body4, DateDisplay,
  INatIcon, InlineUser, TextInputSheet, WarningSheet
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import colors from "styles/tailwindColors";

type Props = {
  classNameMargin?: string,
  currentUser: boolean,
  deleteComment: Function,
  flagged: boolean,
  idWithdrawn?: boolean,
  isConnected?: boolean,
  item: Object,
  loading: boolean,
  updateCommentBody: Function,
  updateIdentification: Function,
  geoprivacy: string,
  taxonGeoprivacy: string,
  belongsToCurrentUser: boolean
}

const ActivityHeader = ( {
  classNameMargin,
  currentUser,
  deleteComment,
  flagged,
  idWithdrawn,
  isConnected,
  item,
  loading,
  updateCommentBody,
  updateIdentification,
  geoprivacy,
  taxonGeoprivacy,
  belongsToCurrentUser
}:Props ): Node => {
  const [showEditCommentSheet, setShowEditCommentSheet] = useState( false );
  const [showDeleteCommentSheet, setShowDeleteCommentSheet] = useState( false );
  const [showWithdrawIDSheet, setShowWithdrawIDSheet] = useState( false );
  const { category, user, vision } = item;

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
        <Body4 maxFontSizeMultiplier={1}>
          {t( "Flagged" )}
        </Body4>
      );
    }
    if ( idWithdrawn ) {
      return (
        <Body4 maxFontSizeMultiplier={1}>
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
        <Body4 maxFontSizeMultiplier={1}>
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
    <View className={classnames( "flex-row justify-between", classNameMargin )}>
      <InlineUser user={user} isConnected={isConnected} />
      <View className="flex-row items-center space-x-[15px] -mr-[15px]">
        {renderIcon()}
        {renderStatus()}
        {/*
          Note that even though the date is conditionally rendered, we need to
          wrap it in a View that's always there so the space-x-[] can be
          calculated
        */}
        <View>
          {item.created_at && (
            <DateDisplay
              dateString={item.updated_at || item.created_at}
              geoprivacy={geoprivacy}
              taxonGeoprivacy={taxonGeoprivacy}
              belongsToCurrentUser={belongsToCurrentUser}
              maxFontSizeMultiplier={1}
            />
          )}
        </View>
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
            onPressClose={() => setShowWithdrawIDSheet( false )}
            taxon={item.taxon}
            updateIdentification={updateIdentification}
          />
        )}

        {( currentUser && showEditCommentSheet ) && (
          <TextInputSheet
            onPressClose={() => setShowEditCommentSheet( false )}
            headerText={t( "EDIT-COMMENT" )}
            initialInput={item.body}
            confirm={textInput => updateCommentBody( textInput )}
          />
        )}
        {( currentUser && showDeleteCommentSheet ) && (
          <WarningSheet
            onPressClose={( ) => setShowDeleteCommentSheet( false )}
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
