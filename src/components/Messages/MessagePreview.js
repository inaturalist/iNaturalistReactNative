// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  message: Object
}

const MessagePreview = ( { message }: Props ): Node => {
  <View className="bg-white" >{message.id}</View>
}

export default MessagePreview;
