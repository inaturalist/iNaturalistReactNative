import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import ObsNotification from "components/Notifications/ObsNotification.tsx";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import type { Notification } from "sharedHooks/useInfiniteNotificationsScroll";
import { ACTIVITY_TAB } from "stores/createLayoutSlice";
import useStore from "stores/useStore";

type Props = {
  notification: Notification
};

const NotificationsListItem = ( { notification }: Props ) => {
  const setObsDetailsTab = useStore( state => state.setObsDetailsTab );
  const navigation = useNavigation( );
  const viewedStatus = notification.viewed;

  return (
    <Pressable
      accessibilityRole="button"
      className={classnames(
        "flex-row items-center justify-between pl-[15px] py-[11px]",
        {
          "bg-inatGreen/10": !viewedStatus,
          "bg-white": viewedStatus

        }
      )}
      onPress={( ) => {
        setObsDetailsTab( ACTIVITY_TAB );
        navigation.navigate( "TabStackNavigator", {
          screen: "ObsDetails",
          params: {
            uuid: notification.resource_uuid,
            targetActivityItemID: notification.identification_id || notification.comment_id
          }
        } );
      }}

    >
      <ObsNotification notification={notification} />
      <View className="pr-[20px] pl-2">
        <View
          className={classnames(
            "h-[10px] w-[10px] rounded-full",
            viewedStatus
              ? "border border-lightGray"
              : "bg-inatGreen"
          )}
        />
      </View>
    </Pressable>
  );
};

export default NotificationsListItem;
