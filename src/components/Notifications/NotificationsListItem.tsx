import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import ObsNotification from "components/Notifications/ObsNotification";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import { useLayoutPrefs } from "sharedHooks";
import type { Notification } from "sharedHooks/useInfiniteNotificationsScroll";
import { OBS_DETAILS_TAB } from "stores/createLayoutSlice";

type Props = {
  notification: Notification;
};

const NotificationsListItem = ( { notification }: Props ) => {
  const { setObsDetailsTab } = useLayoutPrefs( );
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
        setObsDetailsTab( OBS_DETAILS_TAB.ACTIVITY );
        navigation.push( "ObsDetails", {
          uuid: notification.resource_uuid,
          targetActivityItemID: notification.identification_id || notification.comment_id
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
