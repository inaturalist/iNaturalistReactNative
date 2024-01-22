// @flow

import Clipboard from "@react-native-clipboard/clipboard";
import { useNavigation } from "@react-navigation/native";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import {
  Body4,
  Button,
  DateDisplay,
  Divider,
  Heading4,
  ObservationLocation,
  QualityGradeStatus
} from "components/SharedComponents";
import KebabMenu from "components/SharedComponents/KebabMenu";
import Map from "components/SharedComponents/Map";
import Modal from "components/SharedComponents/Modal";
import UserText from "components/SharedComponents/UserText";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import { Alert, Linking } from "react-native";
import createOpenLink from "react-native-open-maps";
import { Menu, useTheme } from "react-native-paper";
import {
  useCurrentUser
} from "sharedHooks";

import Attribution from "./Attribution";
import DetailsMapContainer from "./DetailsMapContainer";

type Props = {
  observation: Object,
  uuid:string
}

const ViewInBrowserButton = ( { id } ) => {
  const url = `https://inaturalist.org/observations/${id}`;
  const handlePress = useCallback( async () => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL( url );

    if ( supported ) {
      await Linking.openURL( url );
    } else {
      Alert.alert( `Don't know how to open this URL: ${url}` );
    }
  }, [url] );

  return (
    <Body4
      className="underline mt-[11px]"
      onPress={handlePress}
    >
      {t( "View-in-browser" )}
    </Body4>
  );
};

const qualityGradeOption = option => {
  switch ( option ) {
    case "research":
      return t( "quality-grade-research" );
    case "needs_id":
      return t( "quality-grade-needs-id" );
    default:
      return t( "quality-grade-casual" );
  }
};

const qualityGradeDescription = option => {
  switch ( option ) {
    case "research":
      return t( "Data-quality-research-description" );
    case "needs_id":
      return t( "Data-quality-needs-id-description" );
    default:
      return t( "Data-quality-casual-description" );
  }
};

const headingClass = "mt-[20px] mb-[11px] text-black";
const sectionClass = "mx-[15px] mb-[20px]";

const DetailsTab = ( { observation }: Props ): Node => {
  const currentUser = useCurrentUser( );
  const navigation = useNavigation( );
  const theme = useTheme( );
  const application = observation?.application?.name;
  const [locationKebabMenuVisible, setLocationKebabMenuVisible] = useState( false );
  const qualityGrade = observation?.quality_grade;
  const observationUUID = observation.uuid;
  const geoprivacy = observation?.geoprivacy;
  const positionalAccuracy = observation?.positional_accuracy;
  const [showMapModal, setShowMapModal] = useState( false );

  const belongsToCurrentUser = observation?.user?.login === currentUser?.login;
  const isPrivate = geoprivacy === "private" && !belongsToCurrentUser;
  const isObscured = observation?.obscured && !belongsToCurrentUser;
  const showShareOptions = !isPrivate && !isObscured;

  const latitude = observation.privateLatitude || observation.latitude;
  const longitude = observation.privateLongitude || observation.longitude;
  const coordinateString = t( "Lat-Lon", {
    latitude,
    longitude
  } );

  const tileMapParams = observation?.taxon?.id
    ? {
      taxon_id: observation.taxon.id
    }
    : null;

  const displayQualityGradeOption = option => {
    const isResearchGrade = ( qualityGrade === "research" && option === "research" );
    const labelClassName = ( qualityGrade === option )
      ? "font-bold"
      : "";
    const opacity = ( qualityGrade === option )
      ? "1"
      : "0.5";
    const color = ( isResearchGrade )
      ? theme.colors.secondary
      : theme.colors.primary;
    return (
      <View className="flex-col space-y-[8px]">
        <QualityGradeStatus qualityGrade={option} opacity={opacity} color={color} />
        <Body4 className={labelClassName}>{ qualityGradeOption( option ) }</Body4>
      </View>
    );
  };

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
      <View className="flex-row justify-between items-center mt-[8px] mx-[15px]">
        <Heading4 className={headingClass}>{t( "LOCATION" )}</Heading4>
        {showShareOptions && (
          <KebabMenu
            visible={locationKebabMenuVisible}
            setVisible={setLocationKebabMenuVisible}
          >
            <Menu.Item
              title={t( "Share-location" )}
              onPress={() => createOpenLink(
                { query: `${latitude},${longitude}` }
              )}
            />
            <Menu.Item
              title={t( "Copy-coordinates" )}
              onPress={() => Clipboard.setString( coordinateString )}
            />
          </KebabMenu>
        )}

      </View>
      { ( latitude ) && (
        <Map
          obsLatitude={latitude}
          obsLongitude={longitude}
          mapHeight={230}
          obscured={isObscured}
          openMapScreen={() => setShowMapModal( true )}
          showLocationIndicator
          positionalAccuracy={positionalAccuracy}
          tileMapParams={tileMapParams}
          withObsTiles={tileMapParams !== null}
        />
      ) }

      <View className={`mt-[11px] space-y-[11px] ${sectionClass}`}>
        <ObservationLocation observation={observation} obscured={isObscured} details />
        {isObscured
        && (
          <Body4 className="italic ml-[20px]">
            {t( "Obscured-observation-location-map-description" )}
          </Body4>
        ) }
      </View>
      <Divider />

      <View className={sectionClass}>
        <Heading4 className={headingClass}>{t( "DATE" )}</Heading4>
        <DateDisplay
          classNameMargin="mb-[12px]"
          label={t( "Date_observed_header_short" )}
          dateString={checkCamelAndSnakeCase( observation, "timeObservedAt" )}
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
          <Button
            testID="DetailsTab.DQA"
            text={t( "VIEW-DATA-QUALITY-ASSESSEMENT" )}
            onPress={() => navigation.navigate( "DataQualityAssessment", {
              qualityGrade,
              observationUUID,
              observation: {
                date: observation.observed_on,
                location: [observation.latitude, observation.longitude],
                evidence: [observation.observationPhotos || observation.observation_photos,
                  observation.observationSounds || observation.sounds],
                taxon: {
                  id: observation.taxon.id,
                  rank_level: observation.taxon.rank_level
                },
                identifications: observation.identifications
              }
            } )}
          />
        </View>
      </View>
      <Divider />

      <View className={sectionClass}>
        <Heading4 className={headingClass}>{t( "PROJECTS" )}</Heading4>
        <Button text={t( "VIEW-PROJECTS" )} />
      </View>

      <Divider />

      <View className={`${sectionClass} space-y-[11px]`}>
        <Heading4 className={headingClass}>{t( "OTHER-DATA" )}</Heading4>
        <Attribution observation={observation} />
        {application && (
          <Body4>{t( "Uploaded-via-application", { application } )}</Body4>
        )}
        <ViewInBrowserButton id={observation.id} />
      </View>
      <Modal
        animationIn="fadeIn"
        animationOut="fadeOut"
        showModal={showMapModal}
        closeModal={( ) => setShowMapModal( false )}
        disableSwipeDirection
        // eslint-disable-next-line react-native/no-inline-styles
        style={{ margin: 0 }}
        modal={(
          <DetailsMapContainer
            observation={observation}
            latitude={latitude}
            longitude={longitude}
            obscured={isObscured}
            closeModal={( ) => setShowMapModal( false )}
            tileMapParams={tileMapParams}
          />
        )}
      />
    </>
  );
};

export default DetailsTab;
