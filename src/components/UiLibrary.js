import INatIcon, { glyphMap } from "components/INatIcon";
import {
  ScrollView,
  Text,
  View
} from "components/styledComponents";
import React from "react";
import { Alert } from "react-native";
import { IconButton, useTheme } from "react-native-paper";
import useCurrentUser from "sharedHooks/useCurrentUser";

import { Button, EvidenceButton } from "./SharedComponents";
import AddObsButton from "./SharedComponents/Buttons/AddObsButton";
import SecondaryCTAButton from "./SharedComponents/Buttons/SecondaryCTAButton";
import InlineUser from "./SharedComponents/InlineUser";
import ViewWithFooter from "./SharedComponents/ViewWithFooter";

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const UiLibrary = ( ) => {
  const theme = useTheme( );
  const currentUser = useCurrentUser();
  return (
    <ViewWithFooter>
      <ScrollView className="px-5">
        {/* TODO replace these text components with our typography header components */}
        <Text>
          All the re-usable UI components we've got. If you're making a new UI
          component, please put it here first and try to show what it looks
          like with different property configurations.
        </Text>

        <Text className="text-xl">Buttons</Text>

        <Text className="text-lg">Button</Text>
        <Button
          className="mb-2"
          level="primary"
          text="PRIMARY BUTTON"
          accessibilityHint="Describes the result of performing the tap action on this element."
        />
        <Button className="mb-2" text="NEUTRAL BUTTON" />
        <Button
          className="mb-2"
          level="focus"
          text="FOCUS BUTTON"
          onPress={( ) => Alert.alert(
            "You Tapped a Button",
            "Or did you click it? Fight me."
          )}
        />
        <Button className="mb-2" level="warning" text="WARNING BUTTON" />
        <Button className="mb-2" level="primary" text="PRIMARY DISABLED" disabled />
        <Button className="mb-2" text="NEUTRAL DISABLED" disabled />
        <Button className="mb-2" level="focus" text="FOCUS DISABLED" disabled />
        <Button className="mb-2" level="warning" text="WARNING DISABLED" disabled />
        <Button className="mb-2" loading text="LOADING BUTTON" />

        <Button
          className="mb-2"
          text="Tap to show alert"
          onPress={( ) => Alert.alert(
            "You Tapped a Button",
            "Or did you click it? Fight me."
          )}
        />
        <Text className="text-xl">Multiple Buttons With Focus</Text>
        <View className="flex-row justify-between">
          <Button className="my-2" text="LEFT" />
          <Button className="my-2 grow ml-3" level="focus" text="RIGHT" />
        </View>

        <Text className="text-xl">Multiple Buttons Without Focus</Text>
        <View className="flex-row">
          <Button className="my-2 grow" text="LEFT" />
          <Button className="my-2 ml-3 grow" text="RIGHT" />
        </View>

        <Text className="text-lg">AddObsButton</Text>
        <Text>
          You probably don't want to tap this because you can't escape the
          modal. Probably need to refactor to separate form from function.
        </Text>
        <AddObsButton />

        <Text className="text-lg">EvidenceButton</Text>
        <View className="flex flex-row justify-between">
          <View>
            <Text className="text-center">Default</Text>
            <EvidenceButton icon="camera" />
          </View>
          <View>
            <Text className="text-center">Disabled</Text>
            <EvidenceButton icon="microphone" disabled />
          </View>
          <View>
            <Text className="text-center">With Icon</Text>
            <EvidenceButton icon="microphone" />
          </View>
        </View>

        <Text className="text-lg">SecondaryCTAButton</Text>
        <SecondaryCTAButton>
          <Text>SecondaryCTAButton</Text>
        </SecondaryCTAButton>
        <SecondaryCTAButton disabled>
          <Text>Disabled SecondaryCTAButton</Text>
        </SecondaryCTAButton>
        <Text className="text-lg">Icon Button w/ Custom iNaturalist Icons</Text>
        <View className="flex flex-row justify-between">
          <View>
            <Text className="text-center">Primary</Text>
            <IconButton
              icon="compass-rose"
              className="my-2"
              onPress={( ) => Alert.alert(
                "",
                "You tapped!"
              )}
            />
          </View>
          <View>
            <Text className="text-center">Focused</Text>
            <IconButton
              icon="plus-sign"
              className="my-2"
              onPress={( ) => Alert.alert(
                "",
                "You tapped!"
              )}
              mode="contained"
              containerColor={theme.colors.secondary}
              iconColor={theme.colors.onSecondary}
            />
          </View>
          <View>
            <Text className="text-center">Warning</Text>
            <IconButton
              icon="notifications-bell"
              className="my-2"
              onPress={( ) => Alert.alert(
                "",
                "You tapped!"
              )}
              iconColor={theme.colors.error}
            />
          </View>
        </View>
        <Text className="text-lg">Custom iNaturalist Icons</Text>
        <Text>
          Make sure you're exporting glyphMap from components/INatIcon.js to see all custom icons
        </Text>
        <View className="flex flex-row flex-wrap justify-center">
          {Object.keys( glyphMap ).map( iconName => (
            <INatIcon
              name={iconName}
              className="p-3"
              key={iconName}
              onPress={( ) => Alert.alert(
                "",
                `You tapped on the ${iconName} icon`
              )}
              size={20}
            />
          ) )}
        </View>
        <Text className="text-lg">InlineUser</Text>
        <Text>InlineUser component</Text>
        <InlineUser
          user={currentUser || {
            icon_url:
            "https://static.inaturalist.org/attachments/users/icons/1044550/medium.jpg?1653532155",
            login: "turtletamer74"
          }}
        />
        <Text>InlineUser component for a user that has no icon set</Text>
        <InlineUser user={{ login: "frogfinder23" }} />

        <Text className="text-lg">More Stuff!</Text>
        <Text className="h-[100px]">
          Useless spacer at the end because height in NativeWind is confusing.
        </Text>
      </ScrollView>
    </ViewWithFooter>
  );
};

export default UiLibrary;
