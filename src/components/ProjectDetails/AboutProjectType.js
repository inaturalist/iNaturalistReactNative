// @flow

import {
  Body2, Heading4
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  projectType: string
}

const AboutProjectType = ( { projectType }: Props ): Node => {
  const { t } = useTranslation( );

  const projectTypes = {
    collection: {
      header: t( "ABOUT-COLLECTION-PROJECTS" ),
      about: t( "Every-time-a-collection-project" )
    },
    traditional: {
      header: t( "ABOUT-TRADITIONAL-PROJECTS" ),
      about: t( "Obervations-must-be-manually-added" )
    },
    umbrella: {
      header: t( "ABOUT-UMBRELLA-PROJECTS" ),
      about: t( "If-you-want-to-collate-compare-promote" )
    }
  };
  const selectedProjectType = projectTypes[projectType] || projectTypes.traditional;

  return (
    <>
      <Heading4 className="mt-5 mb-3">{selectedProjectType.header}</Heading4>
      <Body2>{selectedProjectType.about}</Body2>
    </>
  );
};

export default AboutProjectType;
