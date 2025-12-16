import {
  FloatingActionBar,
  Heading2,
  INatIconButton,
} from "components/SharedComponents";
import React from "react";
import colors from "styles/tailwindColors";

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const FloatingActionBarDemo = ( ) => (
  <FloatingActionBar
    position="bottomEnd"
    containerClass="mx-4 px-2 pb-2 rounded-md"
    endY={80}
    show
  >
    <Heading2 className="my-2">Floating Action Bar</Heading2>
    <INatIconButton
      className="mx-auto"
      icon="star-bold-outline"
      mode="contained"
      color={colors.white}
      backgroundColor={colors.inatGreen}
      accessibilityLabel="Star"
    />
  </FloatingActionBar>
);

export default FloatingActionBarDemo;
