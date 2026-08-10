import type { ApiPostForUser } from "api/types";
import { THUMBNAIL_CLASS } from "appConstants/classNames";
import {
  Body1,
  List2,
} from "components/SharedComponents";
import {
  Image,
  View,
} from "components/styledComponents";
import React, { useMemo } from "react";
import { formatLongDate } from "sharedHelpers/dateAndTime";
import { useTranslation } from "sharedHooks";

// we use the first image from the announcement html body
// as the list post preview. The following regex pattern matches
// <img ..... src="CAPTURE_GROUP_1"
// for testing / reference: https://regexr.com/8no7d
const imgSrcPattern = /<img[^>]*\s+src="([^>\s]+)"/;

interface Props {
  item: ApiPostForUser;
}

const PostListItem = ( {
  item,
}: Props ) => {
  const { i18n } = useTranslation( );

  const imgSrc = useMemo( () => {
    const match = item.body.match( imgSrcPattern );
    return match
      ? match[1]
      : item.parent.icon_url?.replace( "staticdev", "static" ) ?? null;
  }, [item.body, item.parent.icon_url] );

  return (
    <View className="flex-row items-center mx-3 my-2">
      {imgSrc && (
        <Image
          source={{ uri: imgSrc }}
          // Passing a key here is not ideal for FlashList, but we do actually want to avoid
          // recycling on images. When Image gets a new `source` prop, it continues displaying
          // the previously-loaded image until the new source is loaded, which leads to "stale"
          // images being associated with a post. Passing a key forced an unmount/remount.
          key={imgSrc}
          className={THUMBNAIL_CLASS}
          accessibilityRole="image"
          accessibilityIgnoresInvertColors
        />
      )}
      <View className="ml-3 shrink">
        <Body1 numberOfLines={3}>{item.title}</Body1>
        <List2 className="mt-1">
          {formatLongDate( item.published_at, i18n )}
        </List2>
      </View>
    </View>
  );
};

export default PostListItem;
