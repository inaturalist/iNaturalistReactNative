// @flow
import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import ObsNotification from "components/Notifications/ObsNotification";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
item: object
};

const NotificationsListItem = ( { item }: Props ): Node => {
  const navigation = useNavigation( );
  const viewedStatus = item.viewed;

  const unreadIndicator = () => (
    <View className="bg-inatGreen h-[10px] w-[10px] rounded-full" />
  );

  const readIndicator = () => (
    <View className="border border-lightGray h-[10px] w-[10px] rounded-full" />
  );
  return (
    <Pressable
      accessibilityRole="button"
      className={classnames(
        "flex-row items-center justify-between pl-[15px] pr-[20px] py-[11px]",
        {
          "bg-inatGreen/10": !viewedStatus,
          "bg-white": viewedStatus

        }
      )}
      onPress={() => navigation.navigate( "ObsDetails", { uuid: item.resource_uuid } )}

    >
      <ObsNotification item={item} />
      {viewedStatus
        ? readIndicator()
        : unreadIndicator() }
    </Pressable>
  );
};

export default NotificationsListItem;
