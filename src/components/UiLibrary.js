import INatIcon, { glyphMap } from "components/INatIcon";
import ObsStatus from "components/Observations/ObsStatus";
import {
  ActivityCount,
  Body1,
  Body2,
  Body3,
  Body4,
  Button,
  CloseButton,
  DateDisplay,
  EvidenceButton,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  InlineUser,
  List1,
  List2,
  ObservationLocation,
  QualityGradeStatus,
  Subheading1,
  Tabs,
  UserIcon
} from "components/SharedComponents";
import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import SecondaryCTAButton from "components/SharedComponents/Buttons/SecondaryCTAButton";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import { ScrollView, View } from "components/styledComponents";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { IconButton, useTheme } from "react-native-paper";
import useCurrentUser from "sharedHooks/useCurrentUser";

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const UiLibrary = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentUser = useCurrentUser();
  const [loading, setLoading] = useState( false );
  return (
    <ViewWithFooter>
      <ScrollView className="px-5">
        {/* TODO replace these text components with our typography header components */}
        <Body1>
          All the re-usable UI components we've got. If you're making a new UI
          component, please put it here first and try to show what it looks like
          with different property configurations.
        </Body1>
        <Heading1>Buttons</Heading1>
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
            <EvidenceButton icon="camera" />
          </View>
          <View>
            <Body2>Disabled</Body2>
            <EvidenceButton icon="microphone" disabled />
          </View>
          <View>
            <Body2>With Icon</Body2>
            <EvidenceButton icon="microphone" />
          </View>
        </View>

        <Heading2 className="my-2">SecondaryCTAButton</Heading2>
        <SecondaryCTAButton>
          <Body1>SecondaryCTAButton</Body1>
        </SecondaryCTAButton>
        <SecondaryCTAButton disabled>
          <Body1>Disabled SecondaryCTAButton</Body1>
        </SecondaryCTAButton>

        <Heading2 className="my-2">Typography</Heading2>
        <Heading1 className="my-2">Heading1</Heading1>
        <Heading1 className="my-2 text-focusGreen">Heading1 (non-default color)</Heading1>
        <Heading2 className="my-2">Heading2</Heading2>
        <Heading3 className="my-2">Heading3</Heading3>
        <Heading4 className="my-2">Heading4</Heading4>
        <Heading5 className="my-2">Heading5</Heading5>
        <Subheading1 className="my-2">Subheading1</Subheading1>
        <Body1 className="my-2">Body1</Body1>
        <Body2 className="my-2">Body2</Body2>
        <Body3 className="my-2">Body3</Body3>
        <Body4 className="my-2">Body4</Body4>
        <List1 className="my-2">List1</List1>
        <List2 className="my-2">List2</List2>

        <Heading2>Icon Button w/ Custom iNaturalist Icons</Heading2>
        <View className="flex flex-row justify-between">
          <View>
            <Body2>Primary</Body2>
            <IconButton
              icon="compass-rose"
              className="my-2"
              onPress={() => Alert.alert( "", "You tapped!" )}
            />
          </View>
          <View>
            <Body2>Focused</Body2>
            <IconButton
              icon="plus-sign"
              className="my-2"
              onPress={() => Alert.alert( "", "You tapped!" )}
              mode="contained"
              containerColor={theme.colors.secondary}
              iconColor={theme.colors.onSecondary}
            />
          </View>
          <View>
            <Body2>Warning</Body2>
            <IconButton
              icon="notifications-bell"
              className="my-2"
              onPress={() => Alert.alert( "", "You tapped!" )}
              iconColor={theme.colors.error}
            />
          </View>
        </View>

        <Heading2>Special Icon buttons</Heading2>
        <View className="flex flex-row justify-between">
          <View className="bg-secondary">
            <Body2>CloseButton</Body2>
            <CloseButton />
          </View>
        </View>

        <Heading2>Custom iNaturalist Icons</Heading2>
        <Body1>
          Make sure you're exporting glyphMap from components/INatIcon.js to see
          all custom icons
        </Body1>
        {Object.keys( glyphMap )
          .sort()
          .map( iconName => (
            <Body1 key={`icons-${iconName}`}>
              <INatIcon
                name={iconName}
                className="p-3"
                key={iconName}
                onPress={() => Alert.alert( "", `You tapped on the ${iconName} icon` )}
                size={20}
              />
              {" "}
              {iconName}
            </Body1>
          ) )}

        <Heading2 className="my-2">User Icons</Heading2>
        <View className="flex flex-row justify-between mb-3">
          <View>
            <Body2 className="my-2 text-center flex-grow">UserIcon</Body2>
            <UserIcon
              uri={{
                uri: "https://static.inaturalist.org/attachments/users/icons/1044550/medium.jpg?1653532155"
              }}
            />
          </View>
          <View>
            <Body2 className="my-2">InlineUser</Body2>
            <InlineUser
              user={
                currentUser || {
                  icon_url:
                    "https://static.inaturalist.org/attachments/users/icons/1044550/medium.jpg?1653532155",
                  login: "turtletamer74"
                }
              }
            />
          </View>
          <View className="w-[33%]">
            <Body2 className="my-2">
              InlineUser for a user that has no icon set
            </Body2>
            <InlineUser user={{ login: "frogfinder23" }} />
          </View>
        </View>

        <Heading2>Tabs component</Heading2>
        <Tabs
          tabs={[
            {
              id: "TAB1",
              text: "Tab1",
              onPress: () => {
                console.log( "Tab1" );
              }
            },
            {
              id: "TAB2",
              text: "Tab2",
              onPress: () => {
                console.log( "Tab2" );
              }
            }
          ]}
          activeId="TAB1"
        />

        <Heading2 className="my-2">Date Display Component</Heading2>
        <DateDisplay dateTime="2023-12-14T21:07:41-09:30" />

        <Heading2 className="my-2">ObservationLocation Component</Heading2>
        <ObservationLocation
          observation={{
            latitude: 30.18183,
            longitude: -85.760449
          }}
        />

        <ObservationLocation
          observation={{
            latitude: 30.18183,
            longitude: -85.760449,
            place_guess: "Panama City Beach, Florida"
          }}
        />

        <ObservationLocation observation={{}} />

        <Heading2 className="my-2">Quality Grade Status</Heading2>
        <View className="flex flex-row justify-between">
          <View>
            <Body2 className="text-center">Research</Body2>
            {/* TODO: refactor to not have color prop because we only need black and white */}
            {/* TODO: better to access the color from theme here */}
            <QualityGradeStatus qualityGrade="research" color="black" />
          </View>
          <View>
            <Body2 className="text-center">Needs Id</Body2>
            <QualityGradeStatus qualityGrade="needs_id" color="black" />
          </View>
          <View>
            <Body2 className="text-center">Casual</Body2>
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

        <Heading2 className="my-2">ActivityCount</Heading2>
        <View className="flex flex-row justify-evenly">
          <View>
            <Body2>Small Number</Body2>
            <ActivityCount
              count={10}
              color={theme.colors.primary}
              accessibilityLabel={t( "x-comments", { count: 10 } )}
            />
          </View>
          <View>
            <Body2>Large Number</Body2>
            <ActivityCount
              count={20000}
              color={theme.colors.error}
              accessibilityLabel={t( "x-comments", { count: 10 } )}
            />
          </View>
        </View>

        <Heading2 className="my-2">Obs status!</Heading2>

        <ObsStatus
          layout="horizontal"
          observation={{ comments: [1, 2, 3, 4], identifications: [1, 2, 3] }}
          color={theme.colors.primary}
        />

        <ObsStatus
          layout="vertical"
          observation={{
            comments: [1, 2, 3],
            identifications: [1, 2, 3, 4, 5, 6]
          }}
          color={theme.colors.primary}
        />

        <Heading2 className="my-2">More Stuff!</Heading2>
        <Body1 className="h-[400px]">
          Useless spacer at the end because height in NativeWind is confusing.
        </Body1>
      </ScrollView>
    </ViewWithFooter>
  );
};

export default UiLibrary;
