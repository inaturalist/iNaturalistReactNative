// @flow

import { FlashList } from "@shopify/flash-list";
import NotificationsListItem from "components/Notifications/NotificationsListItem";
import {
  Body2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";

type Props = {
    data: Object
  };

const NotificationsList = ( { data }: Props ): Node => {
  const renderItem = useCallback( ( { item } ) => (
    <NotificationsListItem item={item} />
  ), [] );

  const noInfiniteScrollYet = () => (
    // eslint-disable-next-line i18next/no-literal-string
    <Body2>Infinite Scroll not implemented yet</Body2>
  );

  const renderItemSeparator = ( ) => <View className="border-b border-lightGray" />;

  return (
    <View className="h-full">
      <FlashList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderItemSeparator}
        estimatedItemSize={20}
      />
      {noInfiniteScrollYet()}
    </View>
  );
};

export default NotificationsList;
