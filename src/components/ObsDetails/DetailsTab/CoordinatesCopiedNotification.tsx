import classnames from "classnames";
import {
  Body2,
  INatIcon
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

const CoordinatesCopiedNotification = ( ) => (
  <View
    className={classnames(
      "flex",
      "flex-row",
      "justify-center",
      "items-center",
      "bottom-1/2",
      "bg-white",
      "p-3",
      "rounded-xl"
    )}
    style={getShadow( )}
  >
    <Body2 className="mr-3">
      {t( "Coordinates-copied-to-clipboard" )}
    </Body2>
    <INatIcon
      name="checkmark-circle"
      size={19}
      color={colors.inatGreen}
    />
  </View>

);
export default CoordinatesCopiedNotification;
