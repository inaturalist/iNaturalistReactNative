import { RootStackParamList } from "@react-navigation/native";

// Using typescript with react-native-svg-transformer
// from https://www.npmjs.com/package/react-native-svg-transformer?activeTab
declare module "*.svg" {
  import { FC } from "react";
  import { SvgProps } from "react-native-svg";

  const content: FC<SvgProps>;
  export default content;
}

declare global {
  namespace ReactNavigation {
    type RootParamList = RootStackParamList
  }
}
