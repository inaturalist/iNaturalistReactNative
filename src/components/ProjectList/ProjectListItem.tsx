import displayProjectType from "components/Projects/helpers/displayProjectType.ts";
import {
  Body1,
  INatIcon,
  List2
} from "components/SharedComponents";
import { Image, LinearGradient, View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  item: {
    id: string;
    icon: string;
    title: string;
    project_type: string;
  } | undefined | null;
};

const ProjectListItem = ( { item }: Props ) => {
  const { t } = useTranslation( );

  if ( !item ) { return null; }
  return (
    <View
      className="flex-row items-center shrink py-1"
    >
      <View className="w-[62px] h-[62px]">
        <LinearGradient
          colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.6) 100%)"]}
          className="absolute w-full h-full rounded-xl items-center justify-center"
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.75 }}
        >
          <INatIcon
            name="briefcase"
            size={25}
            color={colors.white}
          />
        </LinearGradient>
        <Image
          className="w-[62px] h-[62px] rounded-xl mr-3"
          source={{ uri: item.icon }}
          testID={`Project.${item.id}.photo`}
          accessibilityIgnoresInvertColors
        />
      </View>
      <View className="shrink ml-3">
        <Body1>{item.title}</Body1>
        <List2 className="mt-2">
          {displayProjectType( item.project_type, t )}
        </List2>
      </View>
    </View>
  );
};

export default ProjectListItem;
