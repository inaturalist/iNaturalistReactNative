import classnames from "classnames";
import Button, { ButtonProps } from "components/SharedComponents/Buttons/Button.tsx";
import { View } from "components/styledComponents";
import * as React from "react";

const FullWidthButton = ( props: ButtonProps ) => (
  <View className="items-center">
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <Button {...props} className={classnames( "w-full", props.className )} />
  </View>
);

export default FullWidthButton;
