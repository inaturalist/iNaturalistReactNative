// @flow
import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import ObsNotification from "components/Notifications/ObsNotification";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
item: Object
};

const NotificationsListItem = ( { item }: Props ): Node => {
  const navigation = useNavigation( );
  const viewedStatus = item.viewed;

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
      onPress={() => navigation.navigate( "ObsDetails", { uuid: item.resource_uuid } )}

    >
      <ObsNotification item={item} />
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
