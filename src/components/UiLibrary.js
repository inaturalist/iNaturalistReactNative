import ActivityItem from "components/ObsDetails/ActivityTab/ActivityItem";
import {
  ActivityCount,
  ActivityIndicator,
  Body1,
  Body2,
  Body3,
  Body4,
  Button,
  Checkbox,
  CloseButton,
  CommentsCount,
  ConfidenceInterval,
  DateDisplay,
  DisplayTaxonName,
  Divider,
  EvidenceButton,
  FloatingActionBar,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  IconicTaxonChooser,
  IdentificationsCount,
  INatIcon,
  INatIconButton,
  InlineUser,
  List1,
  List2,
  ObservationLocation,
  ObsStatus,
  PhotoCount,
  ProjectListItem,
  QualityGradeStatus,
  RadioButtonRow,
  SearchBar,
  StickyToolbar,
  Subheading1,
  Tabs,
  TaxonResult,
  UploadStatus,
  UserIcon,
  UserText,
  ViewWrapper
} from "components/SharedComponents";
import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import glyphmap from "components/SharedComponents/INatIcon/glyphmap.json";
import ObsGridItem from "components/SharedComponents/ObservationsFlashList/ObsGridItem";
import ObsListItem from "components/SharedComponents/ObservationsFlashList/ObsListItem";
import { fontMonoClass, ScrollView, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useState } from "react";
import { Alert } from "react-native";
import { useTheme } from "react-native-paper";
import { useCurrentUser, useTranslation } from "sharedHooks";

const { useRealm } = RealmContext;

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const UiLibrary = (): Node => {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentUser = useCurrentUser();
  const userId = currentUser?.id;
  const [loading, setLoading] = useState( false );
  const [isChecked, setIsChecked] = useState( false );
  const realm = useRealm( );
  const userText = `
    User-generated text should support markdown, like **bold**, *italic*, and [links](https://www.inaturalist.org).
  `.trim();
  const exampleId = {
    body: "",
    category: "leading",
    created_at: "2023-01-02T14:34:02-05:00",
    flags: [],
    id: 324447975,
    taxon: {
      // eslint-disable-next-line max-len
      default_photo: {
        attribution: "(c) Ján Svetlík, some rights reserved (CC BY-NC-ND)", id: 3688643, license_code: "cc-by-nc-nd", url: "https://inaturalist-open-data.s3.amazonaws.com/photos/3688643/square.jpg"
      },
      id: 4343,
      name: "Larus",
      preferred_common_name: "Large White-headed Gulls",
      rank: "genus",
      rank_level: 10
    },
    user: {
      icon_url: "https://static.inaturalist.org/attachments/users/icons/1044550/medium.jpg?1653532155",
      id: 1,
      locale: null,
      login: "frogfinder"
    },
    uuid: "9abd103b-097e-4d32-a0a3-6a23f98ca333",
    vision: false
  };

  const aves = {
    id: 1,
    name: "Aves",
    preferred_common_name: "Birds",
    rank: "family",
    rank_level: 60,
    iconic_taxon_name: "Aves",
    isIconic: true
  };
  const taxonWithPhoto = realm.objects( "Taxon" ).filtered( "defaultPhoto.url != nil" )[0] || aves;
  const species = realm.objects( "Taxon" )
    .filtered( "preferred_common_name != nil AND rank = 'species'" )[0];

  return (
    <ViewWrapper>
      <FloatingActionBar
        position="bottomEnd"
        containerClass="mx-4 px-2 pb-2 rounded-md"
        endY={80}
        show
      >
        <Heading2 className="my-2">Floating Action Bar</Heading2>
        <INatIconButton
          className="mx-auto"
          icon="star-bold-outline"
          mode="contained"
          color={theme.colors.onSecondary}
          backgroundColor={theme.colors.secondary}
          accessibilityLabel="Star"
        />
      </FloatingActionBar>
      <ScrollView className="px-5">
        <Body1>
          All the re-usable UI components we've got. If you're making a new UI
          component, please put it here first and try to show what it looks like
          with different property configurations.
        </Body1>
        <Heading1>ActivityIndicator</Heading1>
        <View className="flex-row justify-between">
          <ActivityIndicator />
          <ActivityIndicator color="orange" />
          <ActivityIndicator color="deeppink" size={50} />
        </View>
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

        <Heading2 className="my-2">Typography</Heading2>
        <Heading1 className="my-2">Heading1</Heading1>
        <Heading2 className="my-2">Heading2</Heading2>
        <Heading3 className="my-2">Heading3</Heading3>
        <Heading4 className="my-2">Heading4</Heading4>
        <Heading4 className="my-2 text-inatGreen">
          Heading4 (non-default color)
        </Heading4>
        <Heading5 className="my-2">Heading5</Heading5>
        <Subheading1 className="my-2">Subheading1</Subheading1>
        <Body1 className="my-2">Body1</Body1>
        <Body2 className="my-2">Body2</Body2>
        <Body3 className="my-2">Body3</Body3>
        <Body4 className="my-2">Body4</Body4>
        <List1 className="my-2">List1</List1>
        <List2 className="my-2">List2</List2>

        <Heading3 className="my-2">UserText</Heading3>
        <Heading4 className="my-2">Source</Heading4>
        <Body2 className={fontMonoClass}>{userText}</Body2>
        <Heading4 className="mt-2">Result</Heading4>
        <UserText text={userText} />

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
              backgroundColor={theme.colors.secondary}
              color={theme.colors.onSecondary}
              accessibilityLabel="Add Observation"
            />
          </View>
          <View>
            <Body2>Warning</Body2>
            <INatIconButton
              icon="notifications-bell"
              className="my-2"
              onPress={() => Alert.alert( "", "You tapped!" )}
              color={theme.colors.error}
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
              backgroundColor={theme.colors.error}
              color={theme.colors.onError}
              disabled
            />
          </View>
          <View>
            <Body2>Primary contained</Body2>
            <INatIconButton
              icon="compass-rose-outline"
              accessibilityLabel="Notifications"
              mode="contained"
              backgroundColor={theme.colors.primary}
              color={theme.colors.onPrimary}
            />
          </View>
          <View>
            <Body2>Primary contained disabled</Body2>
            <INatIconButton
              icon="compass-rose-outline"
              accessibilityLabel="Notifications"
              mode="contained"
              backgroundColor={theme.colors.primary}
              color={theme.colors.onPrimary}
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
              color={theme.colors.deepPink}
              backgroundColor={theme.colors.yellow}
              size={44}
            />
            <INatIconButton
              icon="chevron-right-circle"
              accessibilityLabel="Notifications"
              mode="contained"
              preventTransparency
              color={theme.colors.deepPink}
              backgroundColor={theme.colors.yellow}
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
        <Heading2>Custom iNaturalist Icons</Heading2>
        {Object.keys( glyphmap )
          .sort()
          .map( iconName => (
            <Body1 key={`icons-${iconName}`}>
              <INatIcon
                name={iconName}
                className="p-3"
                key={iconName}
                onPress={() => Alert.alert( "", `You tapped on the ${iconName} icon` )}
                size={14}
              />
              {" "}
              {iconName}
            </Body1>
          ) )}
        <Heading2 className="my-2">Checkbox</Heading2>
        <Checkbox
          text="This is a checkbox"
          isChecked={isChecked}
          onPress={( ) => setIsChecked( !isChecked )}
        />
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

        <Heading2 className="my-2">Tabs component</Heading2>
        <Tabs
          tabs={[
            {
              id: "TAB1",
              text: "TAB1",
              onPress: () => {
                console.log( "TAB1" );
              }
            },
            {
              id: "TAB2",
              text: "TAB2",
              onPress: () => {
                console.log( "TAB2" );
              }
            }
          ]}
          activeId="TAB1"
        />

        <Heading2 className="my-2">Divider component</Heading2>
        <Divider />

        <Heading2 className="my-2">Date Display Component</Heading2>
        <DateDisplay dateString="2023-12-14T21:07:41-09:30" />

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
            <QualityGradeStatus qualityGrade="research" />
          </View>
          <View>
            <Body2 className="text-center">Needs Id</Body2>
            <QualityGradeStatus qualityGrade="needs_id" />
          </View>
          <View>
            <Body2 className="text-center">Casual</Body2>
            <QualityGradeStatus qualityGrade="casual" />
          </View>
        </View>
        <View className="flex flex-row justify-between">
          <View>
            <QualityGradeStatus
              qualityGrade="research"
              color={theme.colors.secondary}
            />
          </View>
          <View>
            <QualityGradeStatus
              qualityGrade="needs_id"
              color={theme.colors.secondary}
            />
          </View>
          <View>
            <QualityGradeStatus
              qualityGrade="casual"
              color={theme.colors.secondary}
            />
          </View>
        </View>

        <Heading2 className="my-2">Upload Status</Heading2>
        <View className="flex flex-row justify-between">
          <View>
            <Body2 className="text-center">Progress &lt; 5%</Body2>
            <UploadStatus
              color={theme.colors.primary}
              progress={0.04}
              completeColor={theme.colors.secondary}
            />
          </View>
          <View>
            <Body2 className="text-center">10%</Body2>
            <UploadStatus
              color={theme.colors.primary}
              progress={0.1}
              completeColor={theme.colors.secondary}
            />
          </View>
          <View>
            <Body2 className="text-center">60%</Body2>
            <UploadStatus
              color={theme.colors.primary}
              progress={0.6}
              completeColor={theme.colors.secondary}
            />
          </View>
          <View>
            <Body2 className="text-center">100%</Body2>
            <UploadStatus
              color={theme.colors.primary}
              progress={1}
              completeColor={theme.colors.secondary}
            />
          </View>
        </View>

        <Heading2 className="my-2">ActivityCount</Heading2>
        <View className="flex flex-row justify-evenly">
          <View>
            <Body2>Small Number</Body2>
            <ActivityCount
              count={10}
              accessibilityLabel={t( "x-comments", { count: 10 } )}
            />
          </View>
          <View>
            <Body2>Large Number</Body2>
            <ActivityCount
              count={20000}
              accessibilityLabel={t( "x-comments", { count: 10 } )}
            />
          </View>
          <View className="bg-darkGray">
            <Body2 className="text-white">White</Body2>
            <ActivityCount
              count={3}
              white
              accessibilityLabel={t( "x-comments", { count: 3 } )}
            />
          </View>
        </View>

        <Heading2 className="my-2">CommentsCount</Heading2>
        <View className="flex flex-row justify-evenly">
          <View>
            <Body2>Basic</Body2>
            <CommentsCount count={10} />
          </View>
          <View>
            <Body2>Filled</Body2>
            <CommentsCount count={10} filled />
          </View>
          <View>
            <Body2>Margin</Body2>
            <CommentsCount count={10} classNameMargin="m-2" />
          </View>
          <View className="bg-secondary">
            <Body2 className="text-white">White</Body2>
            <CommentsCount count={10} white />
          </View>
        </View>

        <Heading2 className="my-2">IdentificationsCount</Heading2>
        <View className="flex flex-row justify-evenly">
          <View>
            <Body2>Basic</Body2>
            <IdentificationsCount count={10} />
          </View>
          <View>
            <Body2>Filled</Body2>
            <IdentificationsCount count={10} filled />
          </View>
          <View>
            <Body2>Margin</Body2>
            <IdentificationsCount count={10} classNameMargin="m-2" />
          </View>
          <View className="bg-secondary">
            <Body2 className="text-white">White</Body2>
            <IdentificationsCount count={10} white />
          </View>
        </View>

        <Heading2 className="my-2">Obs status!</Heading2>

        <ObsStatus
          layout="horizontal"
          observation={{ comments: [1, 2, 3, 4], identifications: [1, 2, 3] }}
        />

        <ObsStatus
          layout="vertical"
          observation={{
            comments: [1, 2, 3],
            identifications: [1, 2, 3, 4, 5, 6]
          }}
        />
        <Heading2 className="my-2">PhotoCount</Heading2>
        <View className="my-2 bg-lightGray p-2 rounded-lg flex-row justify-evenly">
          <PhotoCount count={0} />
          <PhotoCount count={2} />
          <PhotoCount count={12} size={50} />
          <PhotoCount count={1000} size={50} shadow />
        </View>

        <Heading2 className="my-2">ActivityItem</Heading2>
        <ActivityItem item={exampleId} currentUserId={userId} />
        <Heading2 className="my-2">Search Bar</Heading2>
        <SearchBar value="search is a really great thing that we should all love" />
        <Heading2 className="my-2">Confidence Interval</Heading2>
        <ConfidenceInterval confidence={3} activeColor="bg-inatGreen" />
        <Heading2 className="my-2">Taxon Result</Heading2>
        <TaxonResult taxon={aves} />
        <Heading3>Taxon w/ photo</Heading3>
        <TaxonResult taxon={taxonWithPhoto} />
        <Heading3>Iconic taxon</Heading3>
        <TaxonResult taxon={aves} fetchRemote={false} fromLocal={false} />
        <Heading2 className="my-2">Iconic Taxon Chooser</Heading2>
        <IconicTaxonChooser
          taxon={{
            name: "Aves",
            id: 3,
            iconic_taxon_name: "Aves"
          }}
          before={<Button text={t( "ADD-AN-ID" )} className="rounded-full" />}
          onTaxonChosen={taxon => console.log( "taxon selected:", taxon )}
        />

        <Heading1 className="my-2">DisplayTaxonName</Heading1>
        <Heading2 className="my-2">Color</Heading2>
        <DisplayTaxonName color="text-blue" taxon={species || taxonWithPhoto} />
        <DisplayTaxonName color="text-green" taxon={species || taxonWithPhoto} />
        <Heading2 className="my-2">Horizontal</Heading2>
        <DisplayTaxonName layout="horizontal" taxon={species || taxonWithPhoto} />
        <Heading2 className="my-2">Scientific name first</Heading2>
        <DisplayTaxonName scientificNameFirst taxon={species || taxonWithPhoto} />
        <Heading2 className="my-2">Small</Heading2>
        <DisplayTaxonName small taxon={species || taxonWithPhoto} />
        <Heading2 className="my-2">Withdrawn</Heading2>
        <DisplayTaxonName withdrawn taxon={species || taxonWithPhoto} />
        <Heading2 className="my-2">Text component customization</Heading2>
        <DisplayTaxonName
          topTextComponent={Heading5}
          bottomTextComponent={Heading3}
          taxon={species || taxonWithPhoto}
        />

        <Heading1 className="my-2">ProjectListItem</Heading1>
        <ProjectListItem
          item={{
            id: 1,
            title: "Project Title",
            project_type: "collection",
            icon: "https://static.inaturalist.org/attachments/users/icons/1044550/medium.jpg?1653532155"
          }}
        />

        <Heading1 className="my-2">RadioButtonRow</Heading1>
        <RadioButtonRow
          value="radio1"
          checked
          onPress={() => console.log( "radio1" )}
          label="Radio 1"
          description="This is a description"
        />

        <Heading1 className="my-2">ObsGridItem</Heading1>
        <Heading2 className="my-2">Synced</Heading2>
        <ObsGridItem
          observation={{ uuid: "the-uuid", _synced_at: new Date( ) }}
          uploadState={false}
        />
        <Heading2 className="my-2">Upload needed</Heading2>
        <ObsGridItem observation={{ uuid: "the-uuid" }} />
        <Heading2 className="my-2">Upload in progress</Heading2>
        <ObsGridItem
          observation={{ uuid: "the-uuid" }}
          uploadState={{ uploadProgress: { "the-uuid": 0.4 } }}
        />
        <Heading2 className="my-2">Upload complete, w/ animation</Heading2>
        <ObsGridItem
          observation={{
            uuid: "the-uuid"
          }}
          uploadState={{ uploadProgress: { "the-uuid": 1 } }}
        />
        <Heading2 className="my-2">Upload complete, before animation</Heading2>
        <ObsGridItem
          observation={{ uuid: "the-uuid" }}
          uploadState={{ uploadProgress: { "the-uuid": 10 } }}
        />
        <Heading2 className="my-2">Upload complete, overlay of animated elements</Heading2>
        <ObsGridItem
          observation={{ uuid: "the-uuid" }}
          uploadState={{ uploadProgress: { "the-uuid": 11 } }}
        />

        <Heading1 className="my-2">ObsListItem</Heading1>
        <Heading2 className="my-2">Synced</Heading2>
        <ObsListItem
          observation={{ uuid: "the-uuid", _synced_at: new Date( ) }}
          uploadState={false}
        />
        <Heading2 className="my-2">Upload needed</Heading2>
        <ObsListItem observation={{ uuid: "the-uuid" }} />
        <Heading2 className="my-2">Upload in progress</Heading2>
        <ObsListItem
          observation={{ uuid: "the-uuid" }}
          uploadState={{ uploadProgress: { "the-uuid": 0.4 } }}
        />
        <Heading2 className="my-2">Upload complete, w/ animation</Heading2>
        <ObsListItem
          observation={{ uuid: "the-uuid" }}
          uploadState={{ uploadProgress: { "the-uuid": 1 } }}
        />
        <Heading2 className="my-2">Upload complete, before animation</Heading2>
        <ObsListItem
          observation={{ uuid: "the-uuid" }}
          uploadState={{ uploadProgress: { "the-uuid": 10 } }}
        />
        <Heading2 className="my-2">Upload complete, overlay of animated elements</Heading2>
        <ObsListItem
          observation={{ uuid: "the-uuid" }}
          uploadState={{ uploadProgress: { "the-uuid": 11 } }}
        />

        <Heading1 className="my-2">More Stuff!</Heading1>
        <Body1 className="h-[400px]">
          Useless spacer at the end because height in NativeWind is confusing.
        </Body1>
      </ScrollView>
      <StickyToolbar>
        <Heading2>StickyToolbar</Heading2>
      </StickyToolbar>
    </ViewWrapper>
  );
};

export default UiLibrary;
