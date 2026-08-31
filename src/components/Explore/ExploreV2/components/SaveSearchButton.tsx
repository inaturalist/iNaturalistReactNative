import classnames from "classnames";
import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

// Matches SortButton, which this sits above in list and grid layouts
const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  elevation: 6,
} );

interface Props {
  className: string;
  isSaved: boolean;
  onPress: ( ) => void;
}

const SaveSearchButton = ( { className, isSaved, onPress }: Props ) => {
  const { t } = useTranslation( );

  return (
    <INatIconButton
      accessibilityLabel={isSaved
        ? t( "Remove-this-saved-search" )
        : t( "Save-this-search" )}
      className={classnames(
        "bg-white rounded-full h-[46px] w-[46px] border-[1px] border-lightGray",
        "absolute z-10 right-5",
        className,
      )}
      color={isSaved
        ? colors.inatGreen
        : colors.darkGray}
      icon={isSaved
        ? "star"
        : "star-bold-outline"}
      onPress={onPress}
      size={18}
      style={DROP_SHADOW}
      testID="SaveSearchButton"
    />
  );
};

export default SaveSearchButton;
