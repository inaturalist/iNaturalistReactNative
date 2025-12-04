// @flow

import { useNavigation } from "@react-navigation/native";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import {
  Body4,
  Button,
  DateDisplay,
  Divider,
  Heading4,
  LabelColonValue,
  QualityGradeStatus
} from "components/SharedComponents";
import UserText from "components/SharedComponents/UserText";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Alert, Platform, Share } from "react-native";
import { openExternalWebBrowser } from "sharedHelpers/util";
import colors from "styles/tailwindColors";

import Attribution from "./Attribution";
import LocationSection from "./LocationSection";
import ProjectSection from "./ProjectSection";

type Props = {
  currentUser: Object,
  observation: Object
};

const OBSERVATION_URL = "https://www.inaturalist.org/observations";

const handleShare = async url => {
  const sharingOptions = {
    url: "",
    message: ""
  };
  if ( Platform.OS === "ios" ) {
    sharingOptions.url = url;
  } else {
    sharingOptions.message = url;
  }
  try {
    return await Share.share( sharingOptions );
  } catch ( err ) {
    Alert.alert( err.message );
    return null;
  }
};

const ViewInBrowserButton = ( { id } ) => (
  <Body4
    className="underline mt-[11px]"
    accessibilityRole="link"
    onPress={async () => openExternalWebBrowser( `${OBSERVATION_URL}/${id}` )}
  >
    {t( "View-in-browser" )}
  </Body4>
);

const ShareButton = ( { id } ) => (
  <Body4
    className="underline mt-[11px]"
    onPress={() => handleShare( `${OBSERVATION_URL}/${id}` )}
  >
    {t( "Share" )}
  </Body4>
);

const qualityGradeOption = option => {
  switch ( option ) {
    case "research":
      return t( "Research-Grade--quality-grade" );
    case "needs_id":
      return t( "Needs-ID--quality-grade" );
    default:
      return t( "Casual--quality-grade" );
  }
};

const qualityGradeDescription = option => {
  switch ( option ) {
    case "research":
      return t( "It-can-now-be-shared-for-use-in-research" );
    case "needs_id":
      return t( "This-observation-needs-more-identifications" );
    default:
      return t( "This-observation-has-not-met-the-conditions-required-to-meet-Research-Grade" );
  }
};

const headingClass = "mt-[20px] mb-[11px] text-darkGray";
const sectionClass = "mx-[15px] mb-[20px]";

const DetailsTab = ( { currentUser, observation }: Props ): Node => {
  const navigation = useNavigation( );
  const application = observation?.application?.name;
  const qualityGrade = observation?.quality_grade;
  const observationUUID = observation?.uuid;

  const displayQualityGradeOption = option => {
    const isResearchGrade = ( qualityGrade === "research" && option === "research" );
    const labelClassName = ( qualityGrade === option )
      ? "font-bold"
      : "";
    const opacity = ( qualityGrade === option )
      ? "1"
      : "0.5";
    const color = ( isResearchGrade )
      ? colors.inatGreen
      : colors.darkGray;
    return (
      <View className="flex-1 flex-col space-y-[8px] items-center">
        <QualityGradeStatus qualityGrade={option} opacity={opacity} color={color} />
        <Body4 className={labelClassName}>{ qualityGradeOption( option ) }</Body4>
      </View>
    );
  };

  if ( !observation ) return null;

  return (
    <>
      {observation.description && (
        <>
          <View className={sectionClass}>
            <Heading4 className={headingClass}>{t( "NOTES" )}</Heading4>
            <UserText>{observation.description}</UserText>
          </View>
          <Divider />
        </>
      )}
      <LocationSection observation={observation} />
      <Divider />
      <View className={sectionClass}>
        <Heading4 className={headingClass}>{t( "DATE" )}</Heading4>
        <DateDisplay
          classNameMargin="mb-[12px]"
          label={t( "Date-observed-header-short" )}
          dateString={
            checkCamelAndSnakeCase( observation, "timeObservedAt" )
            || observation.observed_on_string
            || observation.observed_on
          }
          timeZone={observation.observed_time_zone}
        />
        <DateDisplay
          label={t( "Date-uploaded-header-short" )}
          dateString={checkCamelAndSnakeCase( observation, "createdAt" )}
        />
      </View>
      <Divider />
      <View className={`${sectionClass} flex-col`}>
        <Heading4 className={headingClass}>{t( "DATA-QUALITY" )}</Heading4>
        <View className="space-y-[15px]">
          <View className="flex-row justify-around">
            {displayQualityGradeOption( "casual" )}
            {displayQualityGradeOption( "needs_id" )}
            {displayQualityGradeOption( "research" )}
          </View>
          <Body4>
            {qualityGradeDescription( qualityGrade )}
          </Body4>
          {currentUser && (
            <Button
              testID="DetailsTab.DQA"
              text={t( "VIEW-DATA-QUALITY-ASSESSMENT" )}
              onPress={() => navigation.navigate( "DataQualityAssessment", { observationUUID } )}
            />
          )}
        </View>
      </View>
      <Divider />
      <ProjectSection observation={observation} />
      <View className={`${sectionClass} space-y-[11px]`}>
        <Heading4 className={headingClass}>{t( "OTHER-DATA" )}</Heading4>
        <Attribution observation={observation} />
        {application && (
          <Body4>{t( "Uploaded-via-application", { application } )}</Body4>
        )}
        <View><LabelColonValue label="ID" value={String( observation.id )} valueSelectable /></View>
        <View><LabelColonValue label="UUID" value={observation.uuid} valueSelectable /></View>
        <ViewInBrowserButton id={observation.id} />
        <ShareButton id={observation.id} />
      </View>
    </>
  );
};

export default DetailsTab;
