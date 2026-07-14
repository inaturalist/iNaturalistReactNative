import INatIcon from "components/SharedComponents/INatIcon";
import Body1 from "components/SharedComponents/Typography/Body1";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

interface Props {
  onSelectNearby: ( ) => void;
  onSelectWorldwide: ( ) => void;
}

const ROW_CLASSES = "flex-row items-center px-[15px] py-[11px] border-b border-lightGray";

const LocationDefaultOptions = ( { onSelectNearby, onSelectWorldwide }: Props ) => {
  const { t } = useTranslation( );

  return (
    <View className="border-t border-lightGray" testID="LocationDefaultOptions">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t( "Nearby" )}
        accessibilityHint={t( "Filters-observations-to-your-current-location" )}
        className={ROW_CLASSES}
        onPress={onSelectNearby}
        testID="LocationDefaultOptions.nearby"
      >
        <INatIcon name="map-marker-outline" size={15} color={colors.darkGray} />
        <Body1 className="ml-[10px]">{t( "Nearby" )}</Body1>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t( "Worldwide" )}
        accessibilityHint={t( "Filters-observations-to-anywhere-in-the-world" )}
        className={ROW_CLASSES}
        onPress={onSelectWorldwide}
        testID="LocationDefaultOptions.worldwide"
      >
        <INatIcon name="globe-outline" size={15} color={colors.darkGray} />
        <Body1 className="ml-[10px]">{t( "Worldwide" )}</Body1>
      </Pressable>
    </View>
  );
};

export default React.memo( LocationDefaultOptions );
