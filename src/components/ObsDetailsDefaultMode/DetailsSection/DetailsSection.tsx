import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import Attribution from "components/ObsDetailsSharedComponents/DetailsTab/Attribution";
import {
  Body3,
  DateDisplay,
  Heading3,
  LabelColonValue,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React from "react";
import type { Geoprivacy } from "realmModels/geoprivacy";
import type { License } from "realmModels/types";

import GeoprivacyStatus from "./GeoprivacyStatus";

interface Props {
  observation: {
    id: number;
    application?: { name?: string } | null;
    // checkCamelAndSnakeCase looks up both casings; narrow once Realm models are typed
    createdAt?: string;
    created_at?: string;
    geoprivacy?: Geoprivacy;
    license_code: License | null;
    user?: {
      name?: string | null;
      login?: string;
    };
  };
}

const DetailsSection = ( { observation }: Props ) => {
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
