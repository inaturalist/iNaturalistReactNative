// @flow

import UserIcon from "components/SharedComponents/UserIcon";
import { Text, View } from "components/styledComponents";
import { format, parseISO } from "date-fns";
import type { Node } from "react";
import React from "react";
import colors from "styles/tailwindColors";

type Props = {
  message: Object,
};

const MessagePreview = ( { message }: Props ): Node => {
  console.log( JSON.stringify( message, null, 2 ) );
  return (
    <View
      key={message.id}
      className="bg-white flex flex-row py-4 mx-8 border-b items-center"
      borderColor={colors.borderGray}
    >
      <UserIcon uri={{ uri: message?.from_user?.icon_url }} />
      <View className="flex mx-2 w-6/12">
        <Text className="color-black text-xl font-bold">{message.from_user.login}</Text>
        <Text numberOfLines={1}>{message.subject}</Text>
        <Text className="text-xs mt-2 color-gray">
          {format( parseISO( message.created_at ), "M/d/yy HH:mm a" )}
        </Text>
      </View>
    </View>
  );
};

export default MessagePreview;
