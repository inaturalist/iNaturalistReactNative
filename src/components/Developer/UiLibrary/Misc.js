import ActivityItem from "components/ObsDetails/ActivityTab/ActivityItem";
import ProjectListItem from "components/ProjectList/ProjectListItem";
import {
  ActivityCount,
  Body1,
  Body2,
  Button,
  ButtonBar,
  Checkbox,
  CommentsCount,
  ConfidenceInterval,
  DateDisplay,
  DisplayTaxonName,
  Divider,
  Heading1,
  Heading2,
  Heading3,
  Heading5,
  IconicTaxonChooser,
  IdentificationsCount,
  InlineUser,
  ObservationLocation,
  ObsStatus,
  PhotoCount,
  QualityGradeStatus,
  RadioButtonRow,
  SearchBar,
  Tabs,
  UploadStatus,
  UserIcon,
  ViewWrapper
} from "components/SharedComponents";
import { ScrollView, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useState } from "react";
import { useCurrentUser, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

const { useRealm } = RealmContext;

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const Misc = (): Node => {
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const userId = currentUser?.id;
  const [isChecked, setIsChecked] = useState( false );
  const realm = useRealm( );
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
      <ScrollView className="px-5">
        <Body1>
          All the re-usable UI components we've got. If you're making a new UI
          component, please put it here first and try to show what it looks like
          with different property configurations.
        </Body1>
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
              uri="https://static.inaturalist.org/attachments/users/icons/1044550/medium.jpg?1653532155"
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
              color={colors.inatGreen}
            />
          </View>
          <View>
            <QualityGradeStatus
              qualityGrade="needs_id"
              color={colors.inatGreen}
            />
          </View>
          <View>
            <QualityGradeStatus
              qualityGrade="casual"
              color={colors.inatGreen}
            />
          </View>
        </View>

        <Heading2 className="my-2">Upload Status</Heading2>
        <View className="flex flex-row justify-between">
          <View>
            <Body2 className="text-center">Progress &lt; 5%</Body2>
            <UploadStatus
              color={colors.darkGray}
              progress={0.04}
              completeColor={colors.inatGreen}
            />
          </View>
          <View>
            <Body2 className="text-center">10%</Body2>
            <UploadStatus
              color={colors.darkGray}
              progress={0.1}
              completeColor={colors.inatGreen}
            />
          </View>
          <View>
            <Body2 className="text-center">60%</Body2>
            <UploadStatus
              color={colors.darkGray}
              progress={0.6}
              completeColor={colors.inatGreen}
            />
          </View>
          <View>
            <Body2 className="text-center">100%</Body2>
            <UploadStatus
              color={colors.darkGray}
              progress={1}
              completeColor={colors.inatGreen}
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
          <PhotoCount count={12} />
          <PhotoCount count={1000} />
        </View>

        <Heading2 className="my-2">ActivityItem</Heading2>
        <ActivityItem item={exampleId} currentUserId={userId} />
        <Heading2 className="my-2">Search Bar</Heading2>
        <SearchBar value="search is a really great thing that we should all love" />
        <Heading2 className="my-2">Confidence Interval</Heading2>
        <ConfidenceInterval confidence={3} activeColor="bg-inatGreen" />
        <Heading2 className="my-2">Iconic Taxon Chooser</Heading2>
        <IconicTaxonChooser
          chosen={["aves"]}
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
        <ProjectListItem
          item={{
            id: 2,
            title: "Project Title with a very long title that should wrap to the next line",
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

        <Heading1 className="my-2">More Stuff!</Heading1>
        <Body1 className="h-[400px]">
          Useless spacer at the end because height in NativeWind is confusing.
        </Body1>
      </ScrollView>
      <ButtonBar sticky>
        <Heading2>ButtonBar</Heading2>
      </ButtonBar>
    </ViewWrapper>
  );
};

export default Misc;
