import type { ApiProject } from "api/types";
import classnames from "classnames";
import displayProjectType from "components/Projects/helpers/displayProjectType";
import {
  Body1,
  INatIcon,
  List2,
} from "components/SharedComponents";
import { FasterImageView, View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import formatProjectDate from "../Projects/helpers/displayDates";

const defaultProjectIcon = "https://www.inaturalist.org/attachment_defaults/general/span2.png";

type Props = {
  item?: ApiProject | null;
  isHeader?: boolean;
};

const ProjectListItem = ( { item, isHeader = false }: Props ) => {
  const { t, i18n } = useTranslation( );

  const { projectDate, shouldDisplayDateRange } = formatProjectDate( item, t, i18n );
  const displayDateRange = shouldDisplayDateRange && !isHeader;

  const iconClassName = "w-[62px] h-[62px] rounded-lg bg-white mr-3";

  const displayBriefcase = ( ) => (
    <INatIcon
      name="briefcase"
      size={26}
      color={colors.darkGray}
    />
  );

  const displayProjectIcon = icon => {
    const productionIcon = icon?.replace( "staticdev", "static" );

    if ( productionIcon === defaultProjectIcon ) {
      return (
        <View className={
          classnames(
            iconClassName,
            "border-[2px]",
            "justify-center",
            "items-center",
          )
        }
        >
          {displayBriefcase( )}
        </View>
      );
    }
    return (
      <FasterImageView
        className={
          classnames( iconClassName )
        }
        source={{
          url: productionIcon,
          cachePolicy: "discWithCacheControl",
          resizeMode: "cover",
        }}
        testID={`Project.${item?.id}.photo`}
        accessibilityIgnoresInvertColors
      />
    );
  };

  if ( !item ) { return null; }
  return (
    <View
      className="flex-row items-center shrink py-1"
    >
      {displayProjectIcon( item?.icon )}
      <View className="shrink ml-3">
        <Body1>{item.title}</Body1>
        <List2 className="mt-2">
          {displayDateRange
            ? projectDate
            : displayProjectType( item.project_type, t )}
        </List2>
      </View>
    </View>
  );
};

export default ProjectListItem;
