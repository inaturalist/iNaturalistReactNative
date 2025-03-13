import { FlashList } from "@shopify/flash-list";
import React, {
  forwardRef
} from "react";

const CustomFlashList: Function = forwardRef( ( props, ref ) => (
  <FlashList
    ref={ref}
    disableAutoLayout
    initialNumToRender={5}
    onEndReachedThreshold={0.2}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
) );

export default CustomFlashList;
