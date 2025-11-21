import classNames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { type PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  icon: string;
  size?: number;
  classNameMargin?: string;
}

const ContentWithIcon = ( {
  icon,
  size,
  classNameMargin,
  children
}: Props ) => (
  <View
    className={classNames( "flex-row space-x-[5px]", classNameMargin )}
    testID={`ContentWithIcon.${icon}`}
  >
    <INatIcon name={icon} size={size} />
    {children}
  </View>
);

export default ContentWithIcon;
