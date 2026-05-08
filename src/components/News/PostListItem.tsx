import type { ApiPost } from "api/types";
import {
  Body2, Body3, Heading3,
} from "components/SharedComponents";
import {
  View,
} from "components/styledComponents";
import React from "react";
import { formatDifferenceForHumans } from "sharedHelpers/dateAndTime";
import { useTranslation } from "sharedHooks";

function stripHtmlForPreview( body: string ): string {
  return body.replace( /<[^>]+>/g, " " ).replace( /\s+/g, " " ).trim( );
}

interface Props {
  item?: ApiPost | null;
}

const PostListItem = ( {
  item,
}: Props ) => {
  const { i18n } = useTranslation( );

  if ( !item ) {
    return null;
  }

  const excerpt = item.body
    ? stripHtmlForPreview( item.body )
    : "";

  let bodyNumberOfLines = 3;
  if ( item.title.length > 70 ) {
    bodyNumberOfLines = 2;
  }

  return (
    <View className="bg-white pt-4 pb-4 px-4">
      <Body3 className="text-right text-darkGray">
        { formatDifferenceForHumans( item.published_at, i18n ) }
      </Body3>
      <Heading3 numberOfLines={2}>{item.title}</Heading3>
      <Body2 numberOfLines={bodyNumberOfLines}>{excerpt}</Body2>
    </View>
  );
};

export default PostListItem;
