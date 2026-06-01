import type { ApiPost } from "api/types";
import {
  Body1,
  List2,
} from "components/SharedComponents";
import {
  Image,
  View,
} from "components/styledComponents";
import React from "react";
import { formatLongDate } from "sharedHelpers/dateAndTime";
import { useTranslation } from "sharedHooks";

interface Props {
  item: ApiPost;
}

const PostListItem = ( {
  item,
}: Props ) => {
  const { i18n } = useTranslation( );

  if ( !item ) {
    return null;
  }

  return (
    <View className="bg-white py-3 px-4 flex-row gap-2">
      {item.parent.icon_url && (
        <Image
          source={{ uri: item.parent.icon_url }}
          className="w-[62px] h-[62px] rounded-lg"
          accessibilityRole="image"
          accessibilityIgnoresInvertColors
        />
      )}
      <View className="flex-1">
        <Body1 numberOfLines={3}>{item.title}</Body1>
        <List2 className="mt-1">
          {formatLongDate( item.published_at, i18n )}
        </List2>
      </View>
    </View>
  );
};

export default PostListItem;
