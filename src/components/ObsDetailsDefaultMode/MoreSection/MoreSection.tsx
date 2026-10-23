import {
  Heading3,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React from "react";

import DQAButton from "./DQAButton";
import ProjectButton from "./ProjectButton";
import ShareButton from "./ShareButton";
import ViewInBrowserButton from "./ViewInBrowserButton";

interface Props {
  observation: object;
}

const MoreSection = ( { observation }: Props ) => {
  const observationUUID = observation?.uuid;

  if ( !observation ) return null;

  return (
    <View className="m-4 mb-8">
      <Heading3 className="mt-5 mb-1">{t( "More" )}</Heading3>
      <ProjectButton observation={observation} />
      <DQAButton observationUUID={observationUUID} />
      <ViewInBrowserButton id={observation.id} />
      <ShareButton id={observation.id} />
    </View>
  );
};

export default MoreSection;
