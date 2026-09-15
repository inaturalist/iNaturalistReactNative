import {
  tailwindFontBold,
  tailwindFontBoldItalic,
  tailwindFontMedium,
  tailwindFontMediumItalic,
  tailwindFontRegular,
  tailwindFontRegularItalic,
} from "appConstants/fontFamilies";

type FontWeightTier = "regular" | "medium" | "bold";

const LATO_FAMILY_CLASSES = new Set( [
  tailwindFontRegular,
  tailwindFontMedium,
  tailwindFontBold,
  tailwindFontRegularItalic,
  tailwindFontMediumItalic,
  tailwindFontBoldItalic,
] );

const ITALIC_FAMILY_CLASSES = new Set( [
  tailwindFontRegularItalic,
  tailwindFontMediumItalic,
  tailwindFontBoldItalic,
] );

const TIER_BY_FAMILY_CLASS: Record<string, FontWeightTier> = {
  [tailwindFontRegular]: "regular",
  [tailwindFontRegularItalic]: "regular",
  [tailwindFontMedium]: "medium",
  [tailwindFontMediumItalic]: "medium",
  [tailwindFontBold]: "bold",
  [tailwindFontBoldItalic]: "bold",
};

const FONT_CLASS_BY_TIER: Record<FontWeightTier, { normal: string; italic: string }> = {
  regular: { normal: tailwindFontRegular, italic: tailwindFontRegularItalic },
  medium: { normal: tailwindFontMedium, italic: tailwindFontMediumItalic },
  bold: { normal: tailwindFontBold, italic: tailwindFontBoldItalic },
};

const TIER_BY_WEIGHT_CLASS: Record<string, FontWeightTier> = {
  "font-normal": "regular",
  "font-medium": "medium",
  "font-bold": "bold",
};
const WEIGHT_CLASSES = new Set( Object.keys( TIER_BY_WEIGHT_CLASS ) );

// inspiried by twMerge, this operates on the final resolved inatText
// className boil Lato font-related classes (weight, italic, explicit fontface)
// down to one explicit Lato fontface. This ensures we have control of the resolved
// fontface where Android / iOS were previously inconsistent and unreliable (MOB-1526)
const resolveFontClassName = ( className: string ): string => {
  const classes = className.split( /\s+/ ).filter( Boolean );

  const familyClass = classes.find( c => LATO_FAMILY_CLASSES.has( c ) );
  if ( !familyClass ) {
    // Not one of our custom fonts (e.g. monospace/Menlo, or no family set
    // at all) — RN's normal weight/style synthesis is safe to leave alone.
    return className;
  }

  const weightClass = classes.find( c => WEIGHT_CLASSES.has( c ) );
  const tier = weightClass
    ? TIER_BY_WEIGHT_CLASS[weightClass]
    : TIER_BY_FAMILY_CLASS[familyClass];

  const isItalic = classes.includes( "italic" ) || ITALIC_FAMILY_CLASSES.has( familyClass );

  const resolvedClass = FONT_CLASS_BY_TIER[tier][isItalic
    ? "italic"
    : "normal"];

  const remainingClasses = classes.filter( c => (
    c !== familyClass && c !== weightClass && c !== "italic"
  ) );

  return [...remainingClasses, resolvedClass].join( " " );
};

export default resolveFontClassName;
