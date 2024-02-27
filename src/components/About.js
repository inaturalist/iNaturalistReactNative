// @flow

import {
  Body1,
  Body2,
  Heading4,
  ScrollViewWrapper,
  Tabs,
  ViewWrapper
} from "components/SharedComponents";
import { Image, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { Alert, Linking } from "react-native";
import { getBuildNumber, getVersion } from "react-native-device-info";

const aboutID = "about";
const teamID = "team";

const About = (): Node => {
  const [activeTab, setActiveTab] = useState( aboutID );
  const appVersion = getVersion();
  const buildVersion = getBuildNumber();

  const onTermsPressed = async () => {
    const url = "https://www.inaturalist.org/pages/terms";
    const supported = await Linking.canOpenURL( url );
    if ( supported ) {
      await Linking.openURL( url );
    } else {
      Alert.alert( `Don't know how to open this URL: ${url}` );
    }
  };

  const onPrivacyPressed = async () => {
    const url = "https://www.inaturalist.org/pages/privacy";
    const supported = await Linking.canOpenURL( url );
    if ( supported ) {
      await Linking.openURL( url );
    } else {
      Alert.alert( `Don't know how to open this URL: ${url}` );
    }
  };

  const onCommunityPressed = async () => {
    const url = "https://www.inaturalist.org/pages/community+guidelines";
    const supported = await Linking.canOpenURL( url );
    if ( supported ) {
      await Linking.openURL( url );
    } else {
      Alert.alert( `Don't know how to open this URL: ${url}` );
    }
  };

  return (
    <ViewWrapper>
      <Tabs
        tabs={[
          {
            id: aboutID,
            text: t( "ABOUT" ),
            onPress: () => {
              setActiveTab( aboutID );
            }
          },
          {
            id: teamID,
            text: t( "TEAM" ),
            onPress: () => {
              setActiveTab( teamID );
            }
          }
        ]}
        activeId={activeTab}
      />
      <ScrollViewWrapper>
        {activeTab === aboutID && (
          <View className="px-4 py-8">
            <View className="mb-8 items-center justify-center">
              <Image
                className="w-[250px] h-[45px]"
                resizeMode="contain"
                source={require( "images/inaturalist-dark.png" )}
                accessibilityIgnoresInvertColors
              />
            </View>
            <Heading4 className="mb-3">
              {t( "INATURALIST-MISSION-VISION" )}
            </Heading4>
            <Body2 className="mb-5">
              {t( "iNaturalist-mission-is-to-connect" )}
            </Body2>
            <Body2 className="mb-8">{t( "iNaturalists-vision-is-a-world" )}</Body2>
            <Heading4 className="mb-3">{t( "WHAT-IS-INATURALIST" )}</Heading4>
            <Body2 className="mb-5">
              {t( "iNaturalist-helps-you-identify" )}
            </Body2>
            <Body2 className="mb-5">{t( "Whats-more-by-recording" )}</Body2>
            <Body2 className="mb-8">{t( "iNaturalist-is-supported-by" )}</Body2>
            <Body2
              className="mb-5 underline font-bold"
              onPress={() => onTermsPressed()}
            >
              {t( "Terms-of-Use" )}
            </Body2>
            <Body2
              className="mb-5 underline font-bold"
              onPress={() => onPrivacyPressed()}
            >
              {t( "Privacy-Policy" )}
            </Body2>
            <Body2
              className="mb-8 underline font-bold"
              onPress={() => onCommunityPressed()}
            >
              {t( "Community-Guidelines" )}
            </Body2>
            <View className="items-center justify-center">
              <Body1>{`Version ${appVersion} (${buildVersion})`}</Body1>
            </View>
          </View>
        )}
        {activeTab === teamID && (
          <View className="px-4 py-8">
            <Heading4 className="mb-3">{t( "INATURALIST-TEAM" )}</Heading4>
            <Body2 className="mb-8">
              {t( "iNaturalists-apps-are-designed-and-developed" )}
            </Body2>
            <Heading4 className="mb-3">{t( "INATURALIST-COMMUNITY" )}</Heading4>
            <Body2 className="mb-8">
              {t( "iNaturalist-is-supported-by-community" )}
            </Body2>
            <Heading4 className="mb-3">{t( "INATURALIST-NETWORK" )}</Heading4>
            <Body2 className="mb-8">{t( "The-iNaturalist-Network" )}</Body2>
            <Heading4 className="mb-3">{t( "COLLABORATORS" )}</Heading4>
            <Body2>{t( "The-iNaturalist-team-has-collaborated" )}</Body2>
          </View>
        )}
      </ScrollViewWrapper>
    </ViewWrapper>
  );
};

export default About;
