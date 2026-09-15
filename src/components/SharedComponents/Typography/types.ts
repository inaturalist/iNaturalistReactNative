import type { StyleProp, TextProps, TextStyle } from "react-native";

// fontFamily/fontWeight/fontStyle must only ever be set via className (so
// InatText's resolveFontClassName can see and reconcile them into one real
// Lato-*.ttf file) — an inline style with these keys bypasses the resolver
// entirely and can reintroduce the bug (MOB-1526) it fixes. See fontResolver.ts.
type RestrictedTextStyle = Omit<TextStyle, "fontFamily" | "fontWeight" | "fontStyle">;

export type TypographyProps = Omit<TextProps, "style"> & {
  style?: StyleProp<RestrictedTextStyle>;
};
