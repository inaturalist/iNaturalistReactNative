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
  observation: {
    id: number;
    non_traditional_projects?: object[];
    project_observations?: object[];
    uuid: string;
  };
}

const MoreSection = ( { observation }: Props ) => {
  if ( !observation ) return null;

  const observationUUID = observation.uuid;

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
