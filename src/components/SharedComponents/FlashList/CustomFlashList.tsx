import { FlashList } from "@shopify/flash-list";
import React, {
  forwardRef
} from "react";

const CustomFlashList: Function = forwardRef( ( props, ref ) => (
  <FlashList
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    ref={ref}
    accessible
    disableAutoLayout
    horizontal={false}
    initialNumToRender={5}
    onEndReachedThreshold={0.2}
  />
) );

export default CustomFlashList;
