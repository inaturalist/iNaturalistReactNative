// // @flow

// import classnames from "classnames";
// import { INatIcon } from "components/SharedComponents";
// import { View } from "components/styledComponents";
// import type { Node } from "react";
// import React from "react";

// type Props = {
//   accuracyTest: "string"
// };

// const CrosshairCircle = ( { accuracyTest }: Props ): Node => (
//   <>
//     {/* this crosshair circle might need to be moved out of MapView children,
//     but for now it seems to be correctly positioned in center of map:
//     https://github.com/react-native-maps/react-native-maps#children-components-not-re-rendering
//     */}
//     <View
//       className={classnames( "h-[254px] w-[254px] bg-transparent rounded-full border-[5px]", {
//         "border-inatGreen": accuracyTest === "pass",
//         "border-warningYellow border-dashed": accuracyTest === "acceptable",
//         "border-warningRed": accuracyTest === "fail"
//       } )}
//     >
//       <View className="absolute right-0">
//         <INatIcon name={
//              accuracyTest === "pass" ? "checkmark" : "triangle-exclamation"
//            } size={19}
//          />
//       </View>
//     </View>
//     {/* vertical crosshair */}
//     <View className={classnames( "h-[244px] border border-darkGray absolute" )} />
//     {/* horizontal crosshair */}
//     <View className={classnames( "w-[244px] border border-darkGray absolute" )} />
//   </>
// );

// export default CrosshairCircle;
