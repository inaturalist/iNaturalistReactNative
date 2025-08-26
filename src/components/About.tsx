import { useNavigation } from "@react-navigation/native";
import {
  Body1,
  Body2,
  Button,
  Heading4,
  ScrollViewWrapper,
  Tabs,
  UnderlinedLink,
  ViewWrapper
} from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import React, { useState } from "react";
import { getBuildNumber, getVersion } from "react-native-device-info";
import { useDebugMode } from "sharedHooks";

const aboutID = "about";
const teamID = "team";

const About = ( ) => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState( aboutID );
  const [count, setCount] = useState( 0 );
  const appVersion = getVersion();
  const buildVersion = getBuildNumber();
  const { isDebug, toggleDebug } = useDebugMode( );

  const onTermsPressed = async () => {
    const url = "https://www.inaturalist.org/pages/terms";
    navigation.navigate( "FullPageWebView", {
      title: t( "TERMS-OF-USE" ),
      initialUrl: url,
      loggedIn: false
    } );
  };

  const onPrivacyPressed = async () => {
    const url = "https://www.inaturalist.org/pages/privacy";
    navigation.navigate( "FullPageWebView", {
      title: t( "PRIVACY-POLICY" ),
      initialUrl: url,
      loggedIn: false
    } );
  };

  const onCommunityPressed = async () => {
    const url = "https://www.inaturalist.org/pages/community+guidelines";
    navigation.navigate( "FullPageWebView", {
      title: t( "COMMUNITY-GUIDELINES" ),
      initialUrl: url,
      loggedIn: false
    } );
  };

  const onVersionPressed = () => {
    if ( ( count + 1 ) % 3 === 0 ) {
      toggleDebug();
    }
    setCount( count + 1 );
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
            <UnderlinedLink
              className="mb-5"
              onPress={() => onTermsPressed()}
            >
              {t( "Terms-of-Use" )}
            </UnderlinedLink>
            <UnderlinedLink
              className="mb-5"
              onPress={() => onPrivacyPressed()}
            >
              {t( "Privacy-Policy" )}
            </UnderlinedLink>
            <UnderlinedLink
              className="mb-8"
              onPress={() => onCommunityPressed()}
            >
              {t( "Community-Guidelines" )}
            </UnderlinedLink>
            <Pressable
              accessibilityRole="button"
              className="items-center justify-center"
              onPress={() => onVersionPressed()}
            >
              <Body1>{ t( "Version-app-build", { appVersion, buildVersion } )}</Body1>
            </Pressable>
            {isDebug && (
              <Button
                text="TURN OFF DEBUG MODE"
                className="mt-5 bg-deeppink"
                level="primary"
                onPress={() => {
                  setCount( 0 );
                  toggleDebug();
                }}
              />
            )}
          </View>
        )}
        {activeTab === teamID && (
          <View className="px-4 py-8">
            <Heading4 className="mb-3">{t( "INATURALIST-TEAM" )}</Heading4>
            <Body2 className="mb-8">
              {t( "iNaturalists-apps-are-designed-and-developed-3" )}
            </Body2>
            <Heading4 className="mb-3">{t( "INATURALIST-COMMUNITY" )}</Heading4>
            <Body2 className="mb-8">
              {t( "iNaturalist-is-supported-by-our-community" )}
            </Body2>
            <Heading4 className="mb-3">{t( "INATURALIST-NETWORK" )}</Heading4>
            <Body2 className="mb-8">{t( "The-iNaturalist-Network" )}</Body2>
            <Heading4 className="mb-3">{t( "COLLABORATORS" )}</Heading4>
            <Body2>{t( "The-models-that-suggest-species" )}</Body2>
          </View>
        )}
      </ScrollViewWrapper>
    </ViewWrapper>
  );
};

export default About;
