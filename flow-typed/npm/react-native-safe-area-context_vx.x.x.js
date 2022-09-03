declare module "react-native-safe-area-context" {
  import type { Node } from "react";

  declare interface EdgeInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  declare interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  declare interface Metrics {
    insets: EdgeInsets;
    frame: Rect;
  }

  declare export function useSafeAreaInsets(): EdgeInsets;

  declare type SafeAreaProviderProps = {
    children?: Node,
    initialMetrics?: Metrics | null,
    initialSafeAreaInsets?: EdgeInsets | null,
  };

  declare export function SafeAreaProvider( props: SafeAreaProviderProps ): Node;
}
