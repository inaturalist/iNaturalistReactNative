import INatIcon from "components/SharedComponents/INatIcon";
import Body3 from "components/SharedComponents/Typography/Body3";
import { View } from "components/styledComponents";
import React from "react";

interface Props {
  icon: string;
  testID?: string;
  title: string;
}

const SearchSectionHeader = ( {
  icon,
  testID,
  title,
}: Props ) => (
  <View
    className="flex-row items-center px-[15px] py-[4px] bg-white"
    testID={testID}
  >
    <INatIcon name={icon} size={12} />
    <Body3 className="ml-[8px]">{title}</Body3>
  </View>
);

export default SearchSectionHeader;
