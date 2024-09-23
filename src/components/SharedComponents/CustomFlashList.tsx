import { FlashList } from "@shopify/flash-list";
import React from "react";

const CustomFlashList = props => (
  <FlashList
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    accessible
    disableAutoLayout
    horizontal={false}
    initialNumToRender={5}
    onEndReachedThreshold={0.2}
  />
);
export default CustomFlashList;
