import AddObsButton from "components/AddObsModal/AddObsButton.tsx";
import {
  Body1,
  Body2,
  Body3,
  Button,
  CloseButton,
  EvidenceButton,
  Heading2,
  Heading3,
  INatIconButton,
  ScrollViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useState } from "react";
import { Alert } from "react-native";
import colors from "styles/tailwindColors";

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const Buttons = ( ) => {
  const [loading, setLoading] = useState( false );
  return (
    <ScrollViewWrapper>
      <View className="p-4">
        <Heading2>Button</Heading2>
        <Button
          className="mb-2"
          level="primary"
          text="PRIMARY BUTTON"
          loading={loading}
          onPress={() => setLoading( !loading )}
          accessibilityHint="Describes the result of performing the tap action on this element."
        />
        <Button
          className="mb-2"
          text="NEUTRAL BUTTON"
          loading={loading}
          onPress={() => setLoading( !loading )}
        />
        <Button
          className="mb-2"
          level="focus"
          text="FOCUS BUTTON"
          loading={loading}
          onPress={() => setLoading( !loading )}
        />
        <Button
          className="mb-2"
          level="warning"
          text="WARNING BUTTON"
          loading={loading}
          onPress={() => setLoading( !loading )}
        />
        <Button
          className="mb-2"
          level="primary"
          text="PRIMARY DISABLED"
          disabled
        />
        <Button className="mb-2" text="NEUTRAL DISABLED" disabled />
        <Button className="mb-2" level="focus" text="FOCUS DISABLED" disabled />
        <Button
          className="mb-2"
          level="warning"
          text="WARNING DISABLED"
          disabled
        />
        <Button className="mb-2" loading text="LOADING BUTTON" />
        <Button
          className="mb-2"
          text="Tap to show alert"
          onPress={() => Alert.alert( "You Tapped a Button", "Or did you click it? Fight me." )}
        />

        <Heading2>Multiple Buttons With Focus</Heading2>
        <View className="flex-row justify-between">
          <Button className="my-2" text="LEFT" />
          <Button className="my-2 grow ml-3" level="focus" text="RIGHT" />
        </View>

        <Heading2>Multiple Buttons Without Focus</Heading2>
        <View className="flex-row">
          <Button className="my-2 grow" text="LEFT" />
          <Button className="my-2 ml-3 grow" text="RIGHT" />
        </View>

        <Heading2>AddObsButton</Heading2>
        <Body1 className="my-2">
          You probably don't want to tap this because you can't escape the
          modal. Probably need to refactor to separate form from function.
        </Body1>
        <AddObsButton />

        <Heading2 className="my-2">EvidenceButton</Heading2>
        <View className="flex flex-row justify-between">
          <View>
            <Body2>Default</Body2>
            <EvidenceButton icon="camera" accessibilityLabel="Camera" />
          </View>
          <View>
            <Body2>Disabled</Body2>
            <EvidenceButton
              icon="microphone"
              disabled
              accessibilityLabel="Sound recorder"
            />
          </View>
          <View>
            <Body2>With Icon</Body2>
            <EvidenceButton
              icon="microphone"
              accessibilityLabel="Sound Recorder"
            />
          </View>
        </View>

        <Heading2>Special Icon buttons</Heading2>
        <Heading3>CloseButton</Heading3>
        <View className="bg-darkGray">
          <CloseButton />
        </View>
        <Heading3>INatIconButton</Heading3>
        <View className="flex flex-row justify-between">
          <View>
            <Body2>Primary</Body2>
            <INatIconButton
              icon="compass-rose-outline"
              className="my-2"
              onPress={() => Alert.alert( "", "You tapped!" )}
              accessibilityLabel="Explore"
              size={25}
            />
          </View>
          <View>
            <Body2>Focused</Body2>
            <INatIconButton
              icon="plus"
              className="my-2"
              onPress={() => Alert.alert( "", "You tapped!" )}
              mode="contained"
              backgroundColor={colors.inatGreen}
              color={colors.white}
              accessibilityLabel="Add Observation"
            />
          </View>
          <View>
            <Body2>Warning</Body2>
            <INatIconButton
              icon="notifications-bell"
              className="my-2"
              onPress={() => Alert.alert( "", "You tapped!" )}
              color={colors.warningRed}
              size={25}
              accessibilityLabel="Notifications"
            />
          </View>
        </View>
        <View className="flex flex-row justify-between">
          <View>
            <Body2>Disabled</Body2>
            <INatIconButton
              icon="compass-rose-outline"
              accessibilityLabel="Notifications"
              mode="contained"
              backgroundColor={colors.warningRed}
              color={colors.white}
              disabled
            />
          </View>
          <View>
            <Body2>Primary contained</Body2>
            <INatIconButton
              icon="compass-rose-outline"
              accessibilityLabel="Notifications"
              mode="contained"
              backgroundColor={colors.darkGray}
              color={colors.white}
            />
          </View>
          <View>
            <Body2>Primary contained disabled</Body2>
            <INatIconButton
              icon="compass-rose-outline"
              accessibilityLabel="Notifications"
              mode="contained"
              backgroundColor={colors.darkGray}
              color={colors.white}
              disabled
            />
          </View>
        </View>
        <View className="flex flex-row justify-between">
          <View>
            <Body2>preventTransparency</Body2>
            <INatIconButton
              icon="arrow-down-bold-circle"
              accessibilityLabel="Notifications"
              mode="contained"
              preventTransparency
              color={colors.deepPink}
              backgroundColor={colors.yellow}
              size={44}
            />
            <INatIconButton
              icon="chevron-right-circle"
              accessibilityLabel="Notifications"
              mode="contained"
              preventTransparency
              color={colors.deepPink}
              backgroundColor={colors.yellow}
              size={44}
            />
          </View>
        </View>
        <Body2>More INatIconButton</Body2>
        <Body3>Default</Body3>
        <INatIconButton
          icon="close"
          className="bg-yellow"
          onPress={() => Alert.alert(
            "Default INatIconButton",
            "Should be the minimum accessible size by default"
          )}
          accessibilityLabel="Close button"
        />
        <Body3>Small icon, large tappable area</Body3>
        <INatIconButton
          icon="close"
          className="bg-yellow"
          onPress={() => Alert.alert(
            "Custom INatIconButton",
            "The point is to adjust the interactive area and the icon size independently"
          )}
          size={10}
          width={50}
          height={50}
          accessibilityLabel="Close button"
        />
      </View>
    </ScrollViewWrapper>
  );
};

export default Buttons;
