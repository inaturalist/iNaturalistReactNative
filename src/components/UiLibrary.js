import {
  ScrollView,
  Text,
  View
} from "components/styledComponents";
import React from "react";
import { Alert } from "react-native";

import AddObsButton from "./SharedComponents/Buttons/AddObsButton";
import Button from "./SharedComponents/Buttons/Button";
import EvidenceButton from "./SharedComponents/Buttons/EvidenceButton";
import SecondaryCTAButton from "./SharedComponents/Buttons/SecondaryCTAButton";
import QualityGradeStatus from "./SharedComponents/QualityGradeStatus";
import ViewWithFooter from "./SharedComponents/ViewWithFooter";

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const UiLibrary = ( ) => (
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
      <Button className="mb-2" level="primary" text="PRIMARY BUTTON" />
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
          <EvidenceButton />
        </View>
        <View>
          <Text className="text-center">Disabled</Text>
          <EvidenceButton disabled />
        </View>
        <View>
          <Text className="text-center">With Icon</Text>
          <EvidenceButton icon="photo-camera" />
        </View>
      </View>

      <Text className="text-lg">SecondaryCTAButton</Text>
      <SecondaryCTAButton>
        <Text>SecondaryCTAButton</Text>
      </SecondaryCTAButton>
      <SecondaryCTAButton disabled>
        <Text>Disabled SecondaryCTAButton</Text>
      </SecondaryCTAButton>

      <Text className="text-lg">Quality Grade Status</Text>
      <View className="flex flex-row justify-between">
        <View>
          <Text className="text-center">Research</Text>
          <QualityGradeStatus qualityGrade="research" color="black" />
        </View>
        <View>
          <Text className="text-center">Needs Id</Text>
          <QualityGradeStatus qualityGrade="needs_id" color="black" />
        </View>
        <View>
          <Text className="text-center">Casual</Text>
          <QualityGradeStatus qualityGrade="casual" color="black" />
        </View>
      </View>
      <View className="flex flex-row justify-between">
        <View>
          <QualityGradeStatus qualityGrade="research" color="green" />
        </View>
        <View>
          <QualityGradeStatus qualityGrade="needs_id" color="green" />
        </View>
        <View>
          <QualityGradeStatus qualityGrade="casual" color="green" />
        </View>
      </View>

      <Text className="text-lg">More Stuff!</Text>
      <Text className="h-[100px]">
        Useless spacer at the end because height in NativeWind is confusing.
      </Text>
    </ScrollView>
  </ViewWithFooter>
);

export default UiLibrary;
