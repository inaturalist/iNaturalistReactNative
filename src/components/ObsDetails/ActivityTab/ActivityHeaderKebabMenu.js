// @flow
import KebabMenu from "components/SharedComponents/KebabMenu";
import {
  View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { Menu } from "react-native-paper";

type Props = {
    itemType: string,
    current: boolean,
    currentUser: boolean,
    setShowWithdrawIDSheet: Function,
    withdrawOrRestoreIdentification: Function,
    setShowEditCommentSheet: Function,
    setShowDeleteCommentSheet: Function
}

const ActivityItemKebabMenu = ( {
  itemType, current, currentUser, setShowWithdrawIDSheet,
  withdrawOrRestoreIdentification, setShowEditCommentSheet,
  setShowDeleteCommentSheet
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
      >
        {current === true
          ? (
            <Menu.Item
              onPress={async ( ) => {
                setShowWithdrawIDSheet( true );
                setKebabMenuVisible( false );
              }}
              title={t( "Withdraw" )}
              testID="MenuItem.Withdraw"
            />
          )
          : (
            <Menu.Item
              onPress={async ( ) => {
                withdrawOrRestoreIdentification( true );
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
    >
      <Menu.Item
        onPress={async ( ) => {
          setShowEditCommentSheet( true );
          setKebabMenuVisible( false );
        }}
        title={t( "Edit-comment" )}
        testID="MenuItem.EditComment"
      />
      <Menu.Item
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
