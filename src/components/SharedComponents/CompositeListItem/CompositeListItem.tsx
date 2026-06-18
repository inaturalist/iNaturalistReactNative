import classnames from "classnames";
import INatIcon from "components/SharedComponents/INatIcon";
import Body1 from "components/SharedComponents/Typography/Body1";
import Body3 from "components/SharedComponents/Typography/Body3";
import List2 from "components/SharedComponents/Typography/List2";
import { Pressable, View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React from "react";

// Shared 62px square thumbnail used across composite list rows
// (UserListItem, TaxonResult, ProjectListItem, ExploreV2Header).
export const THUMBNAIL_CLASS = "w-[62px] h-[62px] rounded-lg";

interface CompositeListItemProps extends PropsWithChildren {
  pressable?: boolean;
  onPress?: ( ) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: "button" | "link";
  className?: string;
  testID?: string;
}

// The row container. Renders a Pressable or a plain View depending on
// `pressable`, owning the shared flex-row layout and accessibility wiring.
const CompositeListItem = ( {
  children,
  pressable = true,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  className,
  testID,
}: CompositeListItemProps ) => {
  const containerClass = classnames( "flex-row items-center", className );

  if ( !pressable ) {
    return (
      <View className={containerClass} testID={testID}>
        { children }
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole={accessibilityRole || ( onPress
        ? "button"
        : "link" )}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: false }}
      className={containerClass}
      testID={testID}
      onPress={onPress}
    >
      { children }
    </Pressable>
  );
};

interface ThumbnailProps extends PropsWithChildren {
  className?: string;
}

// Wraps content in the shared 62px box, centering icon-style children.
const Thumbnail = ( { children, className }: ThumbnailProps ) => (
  <View
    className={classnames( THUMBNAIL_CLASS, "items-center justify-center", className )}
  >
    { children }
  </View>
);

interface TextSectionProps extends PropsWithChildren {
  className?: string;
}

// The text column to the right of the thumbnail. A caller-supplied `className`
// fully replaces the default so flex utilities (e.g. `flex-1`) never collide
// with the base `shrink` — NativeWind drops one of two conflicting flex
// utilities when they arrive together in a dynamic className.
const TextSection = ( { children, className }: TextSectionProps ) => (
  <View className={className || "shrink ml-3"}>
    { children }
  </View>
);

interface PrimaryTextProps extends PropsWithChildren {
  className?: string;
}

// First line: the primary name/title, truncated to a single line.
const PrimaryText = ( { children, className }: PrimaryTextProps ) => (
  <Body1
    className={className}
    numberOfLines={1}
    ellipsizeMode="tail"
  >
    { children }
  </Body1>
);

interface SecondaryTextProps extends PropsWithChildren {
  className?: string;
}

// Second line: supporting text (count, type, etc.).
const SecondaryText = ( { children, className }: SecondaryTextProps ) => (
  <List2
    className={classnames( "mt-1", className )}
    maxFontSizeMultiplier={1.5}
  >
    { children }
  </List2>
);

interface LocationLineProps {
  place: string;
  className?: string;
}

// Second line variant showing a place with a location pin. This is the
// swappable line used by ExploreV2Header in place of a count/type line.
const LocationLine = ( { place, className }: LocationLineProps ) => (
  <View className={classnames( "flex-row items-center pt-[5px]", className )}>
    <INatIcon name="location" size={15} />
    <Body3
      maxFontSizeMultiplier={1.5}
      className="ml-[5px]"
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      { place }
    </Body3>
  </View>
);

CompositeListItem.Thumbnail = Thumbnail;
CompositeListItem.TextSection = TextSection;
CompositeListItem.PrimaryText = PrimaryText;
CompositeListItem.SecondaryText = SecondaryText;
CompositeListItem.LocationLine = LocationLine;

export default CompositeListItem;
