import classNames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";

type Props = {
  icon: string,
  size?: number,
  classNameMargin?: string,
  children: React.ReactNode
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
