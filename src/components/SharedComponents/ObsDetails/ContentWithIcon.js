// @flow
import classNames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";

type Props = {
  icon: string,
  size?: number,
  classNameMargin?: string,
  // $FlowIgnore
  children: unknown
}

const ContentWithIcon = ( {
  icon,
  size,
  classNameMargin,
  children
}: Props ): React.Node => (
  <View className={classNames( "flex-row space-x-[5px]", classNameMargin )}>
    <INatIcon name={icon} size={size} />
    {children}
  </View>
);

export default ContentWithIcon;
