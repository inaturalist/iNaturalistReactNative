// @flow

import {
  Body2,
  Button,
  Heading4,
  ScrollViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Alert, Linking } from "react-native";

const Help = (): Node => {
  const onHelpPressed = async () => {
    // TODO: add the correct URL
    const url = "https://help.inaturalist.org/";
    const supported = await Linking.canOpenURL( url );
    if ( supported ) {
      await Linking.openURL( url );
    } else {
      Alert.alert( `Don't know how to open this URL: ${url}` );
    }
  };

  const onContactPressed = async () => {
    // TODO: Should it use react-native-mail or Linking?
    const url = "mailto:support@inaturalist.org";
    try {
      const supported = await Linking.canOpenURL( url );
      if ( supported ) {
        await Linking.openURL( url );
      } else {
        Alert.alert( `Don't know how to open this URL: ${url}` );
      }
    } catch ( canOpenURLError ) {
      if ( canOpenURLError.message.match( /Info.plist/ ) ) {
        Alert.alert(
          "No email in the Simulator",
          "This way of sending email doesn't work in the Simulator. Try it on a physical devicek."
        );
      } else {
        throw canOpenURLError;
      }
    }
  };

  const onTeacherPressed = async () => {
    const url = "https://www.inaturalist.org/pages/teacher's+guide";
    const supported = await Linking.canOpenURL( url );
    if ( supported ) {
      await Linking.openURL( url );
    } else {
      Alert.alert( `Don't know how to open this URL: ${url}` );
    }
  };

  const onForumPressed = async () => {
    const url = "https://forum.inaturalist.org";
    const supported = await Linking.canOpenURL( url );
    if ( supported ) {
      await Linking.openURL( url );
    } else {
      Alert.alert( `Don't know how to open this URL: ${url}` );
    }
  };

  return (
    <ScrollViewWrapper>
      <View className="p-4">
        <Heading4 className="mb-3">{t( "INATURALIST-HELP-PAGE" )}</Heading4>
        <Body2 className="mb-5">
          {t( "You-can-find-answers-on-our-help-page" )}
        </Body2>
        <Button
          className="mb-8"
          level="neutral"
          text={t( "VIEW-INATURALIST-HELP" )}
          onPress={() => onHelpPressed()}
        />
        <Heading4 className="mb-3">{t( "CONTACT-SUPPORT" )}</Heading4>
        <Body2 className="mb-5">
          {t( "Still-need-help" )}
        </Body2>
        <Button
          className="mb-8"
          level="neutral"
          text={t( "CONTACT-SUPPORT" )}
          onPress={() => onContactPressed()}
        />
        <Heading4 className="mb-3">{t( "TEACHERS" )}</Heading4>
        <Body2 className="mb-5">
          {t( "Are-you-a-teacher" )}
        </Body2>
        <Button
          className="mb-8"
          level="neutral"
          text={t( "VIEW-TEACHERS-GUIDE" )}
          onPress={() => onTeacherPressed()}
        />
        <Heading4 className="mb-3">{t( "INATURALIST-FORUM" )}</Heading4>
        <Body2 className="mb-5">
          {t( "Connect-with-other-naturalists" )}
        </Body2>
        <Button
          className="mb-8"
          level="neutral"
          text={t( "INATURALIST-FORUM" )}
          onPress={() => onForumPressed()}
        />
      </View>
    </ScrollViewWrapper>
  );
};

export default Help;
