// @flow

import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import {
  Body3,
  DateDisplay,
  Heading3,
  Heading4
} from "components/SharedComponents";
import UserText from "components/SharedComponents/UserText.tsx";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

import Attribution from "./Attribution";

type Props = {
  observation: Object
}

const headingClass = "mt-[20px] mb-[11px] text-darkGray";
const sectionClass = "mx-[15px] mb-[20px]";

const DetailsSection = ( { observation }: Props ): Node => {
  const application = observation?.application?.name;

  if ( !observation ) return null;

  return (
    <View className="mx-4 mt-8">
      <Heading3>{t( "Details" )}</Heading3>
      {observation.description && (
        <View className={sectionClass}>
          <Heading4 className={headingClass}>{t( "NOTES" )}</Heading4>
          <UserText>{observation.description}</UserText>
        </View>
      )}
      <Attribution observation={observation} />

      <View className="mt-3">
        <DateDisplay
          label={t( "Date-uploaded-header-short" )}
          dateString={checkCamelAndSnakeCase( observation, "createdAt" )}
          hideIcon
          textComponent={Body3}
        />
      </View>
      {application && (
        <Body3 className="mt-3">{t( "Uploaded-via-application", { application } )}</Body3>
      )}
    </View>
  );
};

export default DetailsSection;
