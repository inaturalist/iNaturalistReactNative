import {
  ScrollView,
  Text,
  View
} from "components/styledComponents";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";

import AddObsButton from "./SharedComponents/Buttons/AddObsButton";
import Button from "./SharedComponents/Buttons/Button";
import EvidenceButton from "./SharedComponents/Buttons/EvidenceButton";
import SecondaryCTAButton from "./SharedComponents/Buttons/SecondaryCTAButton";
import ViewWithFooter from "./SharedComponents/ViewWithFooter";

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const UiLibrary = ( ) => {
  const [loading, setLoading] = useState( true );
  useEffect( () => {
    setTimeout( () => {
      setLoading( false );
    }, 4000 );
  }, [] );

  return (
    <ViewWithFooter>
      <ScrollView className="px-5">
        {/* TODO replace these text components with our typography header components */}
        <Text>
          All the re-usable UI components we've got. If you're making a new UI
          component, please put it here first and try to show what it looks like
          with different property configurations.
        </Text>

        <Text className="text-xl">Buttons</Text>

        <Text className="text-lg">Button</Text>
        <Button
          testID="ui-button-1"
          className="mb-2"
          level="warning"
          text="Warning Button"
        />
        <Button testID="ui-button-2" className="mb-2" text="Default Button" />
        <Button
          testID="ui-button-3"
          className="mb-2"
          level="primary"
          text="Primary Button"
        />
        <Button
          testID="ui-button-4"
          className="mb-2"
          disabled
          text="Disabled Button"
        />
        <Button
          testID="ui-button-5"
          className="mb-2"
          loading={loading}
          text="Loading Button"
        />
        <Button
          testID="ui-button-6"
          className="mb-2"
          text="Tap to show alert"
          onPress={() => Alert.alert( "You Tapped a Button", "Or did you click it? Fight me." )}
        />

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
            <EvidenceButton testID="ui-evidence-button-1" />
          </View>
          <View>
            <Text className="text-center">Disabled</Text>
            <EvidenceButton testID="ui-evidence-button-2" disabled />
          </View>
          <View>
            <Text className="text-center">With Icon</Text>
            <EvidenceButton testID="ui-evidence-button-3" icon="photo-camera" />
          </View>
        </View>

        <Text className="text-lg">SecondaryCTAButton</Text>
        <SecondaryCTAButton testID="ui-secondary-cta-button-1">
          <Text>SecondaryCTAButton</Text>
        </SecondaryCTAButton>
        <SecondaryCTAButton testID="ui-secondary-cta-button-2" disabled>
          <Text>Disabled SecondaryCTAButton</Text>
        </SecondaryCTAButton>

        <Text className="text-lg">More Stuff!</Text>
        <Text className="h-[100px]">
          Useless spacer at the end because height in NativeWind is confusing.
        </Text>
      </ScrollView>
    </ViewWithFooter>
  );
};

export default UiLibrary;
