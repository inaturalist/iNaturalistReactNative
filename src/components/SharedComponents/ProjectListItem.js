// @flow
import displayProjectType from "components/Projects/helpers/displayProjectType";
import {
  Body1,
  List2
} from "components/SharedComponents";
import { Image, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  item: any
};

const ProjectListItem = ( { item }: Props ): Node => {
  const { t } = useTranslation( );

  if ( !item ) { return null; }
  return (
    <View
      className="flex-row items-center"
    >
      <Image
        className="w-[62px] h-[62px] rounded-xl mr-3"
        source={{ uri: item.icon }}
        testID={`Project.${item.id}.photo`}
        accessibilityIgnoresInvertColors
      />
      <View className="shrink">
        <Body1>{item.title}</Body1>
        <List2 className="mt-2">
          {displayProjectType( item.project_type, t )}
        </List2>
      </View>
    </View>
  );
};

export default ProjectListItem;
