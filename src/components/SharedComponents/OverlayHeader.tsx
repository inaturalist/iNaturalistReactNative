import {
  BackButton
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import React from "react";

interface Props {
  rightHeaderButton: React.JSX.Element;
  testID: string
}

const OverlayHeader = ( {
  rightHeaderButton,
  testID
}: Props ) => (
  <View
    className="w-full justify-between flex-row px-[13px] h-100"
    pointerEvents="box-none"
  >
    <View className="pt-[21px]">
      <BackButton color="white" inCustomHeader testID={testID} />
    </View>
    <View className="pt-[7px]">
      {rightHeaderButton}
    </View>
  </View>
);

export default OverlayHeader;
