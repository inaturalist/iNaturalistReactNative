import type { ColorValue, ViewProps } from "react-native";
import {
  codegenNativeComponent,
} from "react-native";

interface NativeProps extends ViewProps {
  color?: ColorValue;
}

export default codegenNativeComponent<NativeProps>( "NativeNewsView" );
