import classnames from "classnames";
import {
  Body2,
  Button,
  Heading2,
  INatIcon,
  INatIconButton,
  ViewWrapper
} from "components/SharedComponents";
import {
  ImageBackground,
  View
} from "components/styledComponents";
import { t } from "i18next";
import React from "react";
import {
  Linking
} from "react-native";
import { RESULTS } from "react-native-permissions";
import colors from "styles/tailwindColors";

const BACKGROUND_IMAGE_STYLE = {
  opacity: 0.33,
  backgroundColor: "black"
};

const PermissionGate = ( {
  requestPermission,
  grantStatus,
  icon,
  title = t( "Grant-Permission" ),
  titleDenied = t( "Please-Grant-Permission" ),
  body,
  blockedPrompt = t( "Youve-denied-permission-prompt" ),
  buttonText = t( "GRANT-PERMISSION" ),
  image = require( "images/bart-zimny-W5XTTLpk1-I-unsplash.jpg" ),
  onClose
} ) => (
  <ViewWrapper wrapperClassName="bg-black">
    <ImageBackground
      source={image}
      imageStyle={BACKGROUND_IMAGE_STYLE}
      accessibilityIgnoresInvertColors
      className={classnames(
        "w-full",
        "h-full"
      )}
    >
      <INatIconButton
        icon="close"
        color={colors.white}
        onPress={() => onClose( )}
        className="absolute top-2 right-2 z-10"
      />
      <View
        className={classnames(
          "w-full",
          "h-full",
          "sm:justify-end",
          "p-5",
          "items-center"
        )}
      >
        { icon && (
          <INatIcon
            name={icon}
            color={colors.white}
            size={40}
          />
        ) }
        <Heading2 className="text-center text-white mt-8 mb-8">
          { grantStatus === null
            ? title
            : titleDenied}
        </Heading2>
        { body && (
          <Body2 className="text-center text-white mb-10">{ body }</Body2>
        ) }
        { grantStatus === RESULTS.BLOCKED && (
          <Body2 className="text-center text-white mb-10">
            { blockedPrompt }
          </Body2>
        ) }
        { grantStatus === RESULTS.BLOCKED
          ? (
            <Button
              level="focus"
              onPress={( ) => Linking.openSettings( )}
              text={t( "OPEN-SETTINGS" )}
              className="w-full"
            />
          )
          : (
            <Button
              level="focus"
              onPress={requestPermission}
              text={buttonText}
              className="w-full"
            />
          )}
      </View>
    </ImageBackground>
  </ViewWrapper>
);

export default PermissionGate;
