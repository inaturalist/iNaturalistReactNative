// @flow
import KebabMenu from "components/SharedComponents/KebabMenu";
import {
  View,
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";

type Props = {
  current: boolean,
  currentUser: boolean,
  itemType: "Identification" | "Comment",
  setShowDeleteCommentSheet: Function,
  setShowEditCommentSheet: Function,
  setShowWithdrawIDSheet: Function,
  updateIdentification: Function,
}

const ActivityItemKebabMenu = ( {
  current,
  currentUser,
  itemType,
  setShowDeleteCommentSheet,
  setShowEditCommentSheet,
  setShowWithdrawIDSheet,
  updateIdentification,
}:Props ): Node => {
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );

  if ( !currentUser ) {
    // flags removed from mvp
    // placeholder for kebabmenu
    return <View className="h-[44px] mr-[15px]" />;
  }

  if ( itemType === "Identification" ) {
    return (
      <KebabMenu
        visible={kebabMenuVisible}
        setVisible={setKebabMenuVisible}
        accessibilityLabel={t( "Identification-options" )}
      >
        {current === true
          ? (
            <KebabMenu.Item
              isFirst
              onPress={async ( ) => {
                setShowWithdrawIDSheet( true );
                setKebabMenuVisible( false );
              }}
              title={t( "Withdraw" )}
              testID="MenuItem.Withdraw"
            />
          )
          : (
            <KebabMenu.Item
              isFirst
              onPress={async ( ) => {
                updateIdentification( { current: true } );
                setKebabMenuVisible( false );
              }}
              title={t( "Restore" )}
            />
          )}
      </KebabMenu>
    );
  }

  return (
    <KebabMenu
      visible={kebabMenuVisible}
      setVisible={setKebabMenuVisible}
      accessibilityLabel={t( "Comment-options" )}
    >
      <KebabMenu.Item
        onPress={async ( ) => {
          setShowEditCommentSheet( true );
          setKebabMenuVisible( false );
        }}
        title={t( "Edit-comment" )}
        testID="MenuItem.EditComment"
      />
      <KebabMenu.Item
        onPress={async ( ) => {
          setShowDeleteCommentSheet( true );
          setKebabMenuVisible( false );
        }}
        title={t( "Delete-comment" )}
        testID="MenuItem.DeleteComment"
      />
    </KebabMenu>
  );
};

export default ActivityItemKebabMenu;
