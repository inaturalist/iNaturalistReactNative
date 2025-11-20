// Using typescript with react-native-svg-transformer
// from https://www.npmjs.com/package/react-native-svg-transformer?activeTab
declare module "*.svg" {
  import type { FC } from "react";
  import type { SvgProps } from "react-native-svg";

  const content: FC<SvgProps>;
  export default content;
}
