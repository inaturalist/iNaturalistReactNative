import type { ViewProps } from "react-native";
import {
  codegenNativeComponent,
} from "react-native";

/* eslint-disable @typescript-eslint/no-empty-object-type */
interface NativeProps extends ViewProps {
}

export default codegenNativeComponent<NativeProps>( "InaturalistMobileNativeScreensView" );
