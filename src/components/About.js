// @flow

import {
  Body1,
  HideView,
  Tabs,
  ViewWrapper
} from "components/SharedComponents";
import { ScrollView, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { getBuildNumber, getVersion } from "react-native-device-info";

const aboutID = "about";
const teamID = "team";

const About = (): Node => {
  const [activeTab, setActiveTab] = useState( aboutID );
  const appVersion = getVersion();
  const buildVersion = getBuildNumber();

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

      <ScrollView className="p-4">
        <HideView show={activeTab === aboutID}>
          <View className="mb-8 items-center justify-center">
            <Body1>{`Version ${appVersion} (${buildVersion})`}</Body1>
          </View>
        </HideView>
        <HideView noInitialRender show={activeTab === teamID} />
      </ScrollView>
    </ViewWrapper>
  );
};

export default About;
