// @flow

import {
  Body2,
  Body4,
  Button,
  DateDisplay,
  Heading4,
  ObservationLocation,
  QualityGradeStatus
} from "components/SharedComponents";
import KebabMenu from "components/SharedComponents/KebabMenu";
import Map from "components/SharedComponents/Map";
import { View } from "components/styledComponents";
import { t } from "i18next";
import _ from "lodash";
import type { Node } from "react";
import React, { useState } from "react";
import { Divider, Menu } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useIsConnected from "sharedHooks/useIsConnected";

import Attribution from "./Attribution";
import checkCamelAndSnakeCase from "./helpers/checkCamelAndSnakeCase";

type Props = {
  observation: Object
}

const headingClass = "mt-[20px] mb-[11px] text-black";
const sectionClass = "mx-[15px] mb-[20px]";

const DetailsTab = ( { observation }: Props ): Node => {
  const isOnline = useIsConnected( );
  const application = observation?.application?.name;
  const [locationKebabMenuVisible, setLocationKebabMenuVisible] = useState( false );

  const displayQualityGradeOption = option => {
    const qualityGrade = observation?.quality_grade;
    const labelClassName = ( qualityGrade === option ) ? "font-bold" : "";

    return (
      <View className="flex-col space-y-[8px]">
        <QualityGradeStatus qualityGrade={option} />
        <Body4 className={labelClassName}>{_.startCase( _.camelCase( t( option ) ) )}</Body4>
      </View>
    );
  };

  return (
    <>
      {observation.description && (
        <>
          <View className={sectionClass}>
            <Heading4 className={headingClass}>{t( "NOTES" )}</Heading4>
            <Body2>{observation.description}</Body2>
          </View>
          <Divider />
        </>
      )}

      <View className="flex-row justify-between items-center mt-[8px] mx-[15px]">
        <Heading4>{t( "LOCATION" )}</Heading4>
        <KebabMenu
          visible={locationKebabMenuVisible}
          setVisible={setLocationKebabMenuVisible}
        >
          <Menu.Item
            onPress={async ( ) => {

            }}
            title={t( "Share-location" )}
          />
          <Menu.Item
            onPress={async ( ) => {

            }}
            title={t( "Copy-coordinates" )}
          />
        </KebabMenu>
      </View>
      {isOnline
        ? (
          <Map
            obsLatitude={observation.latitude}
            obsLongitude={observation.longitude}
            mapHeight={230}
          />
        ) : (
          <View className="h-16 items-center justify-center">
            <IconMaterial
              name="wifi-off"
              size={30}
              accessibilityRole="image"
              accessibilityLabel={t( "Location-map-unavailable-without-internet" )}
            />
          </View>
        )}
      <View className={`mt-[11px] ${sectionClass}`}>
        <ObservationLocation observation={observation} details />
      </View>
      <Divider />

      <View className={sectionClass}>
        <Heading4 className={headingClass}>{t( "DATE" )}</Heading4>
        <DateDisplay
          classNameMargin="mb-[12px]"
          label={t( "Observed" )}
          dateString={checkCamelAndSnakeCase( observation, "timeObservedAt" )}
        />
        <DateDisplay
          label={t( "Uploaded" )}
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
            {t( "This observation needs more identifications to reach research grade" )}
          </Body4>
          <Button text={t( "VIEW DATA QUALITY ASSESSEMENT" )} />
        </View>
      </View>
      <Divider />

      <View className={sectionClass}>
        <Heading4 className={headingClass}>{t( "PROJECTS" )}</Heading4>
        <Button text={t( "VIEW PROJECTS" )} />
      </View>

      <Divider />

      <View className={`${sectionClass} space-y-[11px]`}>
        <Heading4 className={headingClass}>{t( "OTHER-DATA" )}</Heading4>
        <Attribution observation={observation} />
        {application && (
          <View className="flex-row">
            <Body4>{t( "Uploaded-via" )}</Body4>
            <Body4>{application}</Body4>
          </View>
        )}
        <Body4>{t( "View in Browser" )}</Body4>
      </View>
    </>
  );
};

export default DetailsTab;
