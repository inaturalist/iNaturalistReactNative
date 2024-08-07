import { RootStackParamList } from "@react-navigation/native";

// Using typescript with react-native-svg-transformer
// from https://www.npmjs.com/package/react-native-svg-transformer?activeTab
declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";

  const content: React.FC<SvgProps>;
  export default content;
}

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends RootStackParamList {}
  }
}
