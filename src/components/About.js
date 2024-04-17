// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  Body1,
  Body2,
  Button,
  Heading4,
  ScrollViewWrapper,
  Tabs,
  ViewWrapper
} from "components/SharedComponents";
import { Image, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { getBuildNumber, getVersion } from "react-native-device-info";
import { useDebugMode } from "sharedHooks";

const aboutID = "about";
const teamID = "team";

const About = (): Node => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState( aboutID );
  const appVersion = getVersion();
  const buildVersion = getBuildNumber();
  const { isDebug, toggleDebug } = useDebugMode( );

  const onTermsPressed = async () => {
    const url = "https://www.inaturalist.org/pages/terms";
    navigation.navigate( "FullPageWebView", {
      title: t( "Terms-of-Use" ),
      initialUrl: url,
      loggedIn: false,
      openLinksInBrowser: true
    } );
  };

  const onPrivacyPressed = async () => {
    const url = "https://www.inaturalist.org/pages/privacy";
    navigation.navigate( "FullPageWebView", {
      title: t( "Privacy-Policy" ),
      initialUrl: url,
      loggedIn: false,
      openLinksInBrowser: true
    } );
  };

  const onCommunityPressed = async () => {
    const url = "https://www.inaturalist.org/pages/community+guidelines";
    navigation.navigate( "FullPageWebView", {
      title: t( "Community-Guidelines" ),
      initialUrl: url,
      loggedIn: false,
      openLinksInBrowser: true
    } );
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
            <Image
              className="w-[65%] max-h-12 xl:max-h-24 2xl:max-h-32 object-center self-center mb-8"
              resizeMode="contain"
              source={require( "images/inaturalist-dark.png" )}
              accessibilityIgnoresInvertColors
            />
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
            <Button
              // eslint-disable-next-line multiline-ternary
              text={`Debug Mode: ${isDebug ? "on" : "off"}`}
              className={classnames(
                "mt-5",
                isDebug
                  ? "bg-deeppink"
                  : "border-deeppink"
              )}
              level={
                isDebug
                  ? "primary"
                  : null
              }
              onPress={toggleDebug}
            />
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
