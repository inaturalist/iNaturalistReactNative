// @flow

import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import {
  Body3,
  DateDisplay,
  Heading3,
  LabelColonValue,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

import Attribution from "./Attribution";
import GeoprivacyStatus from "./GeoprivacyStatus";

type Props = {
  observation: Object
}

const DetailsSection = ( { observation }: Props ): Node => {
  const application = observation?.application?.name;

  if ( !observation ) return null;

  return (
    <View className="mx-4 mt-8">
      <Heading3>{t( "Details" )}</Heading3>
      <GeoprivacyStatus geoprivacy={observation?.geoprivacy} />
      <Attribution observation={observation} />
      <View className="mt-3">
        <DateDisplay
          label={t( "Date-uploaded-on-header-short" )}
          dateString={checkCamelAndSnakeCase( observation, "createdAt" )}
          hideIcon
          textComponent={Body3}
        />
      </View>
      {application && (
        <Body3 className="mt-3">
          {t( "Uploaded-via-application", { application } )}
        </Body3>
      )}
      <View className="mt-3">
        <LabelColonValue
          label="ID"
          value={String( observation.id )}
          valueSelectable
          LabelComponent={Body3}
          ValueComponent={Body3}
        />
      </View>
    </View>
  );
};

export default DetailsSection;
