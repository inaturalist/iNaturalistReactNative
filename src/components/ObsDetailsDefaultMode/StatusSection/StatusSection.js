// @flow

import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import {
  Body3,
  Heading3
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

type Props = {
  observation: Object
}

const StatusSection = ( { observation }: Props ): Node => {
  if ( !observation ) return null;

  const qualityGrade = checkCamelAndSnakeCase( observation, "qualityGrade" );
  const qualityGradeText = () => {
    if ( qualityGrade === "research" ) {
      return t( "This-observation-is-research-grade-and-can-be-used-by-scientists" );
    }
    if ( qualityGrade === "needs_id" ) {
      return t( "This-observation-needs-more-identifications-to-become-research-grade" );
    }
    return t( "This-observation-is-not-eligible-for-research-grade-status" );
  };

  return (
    <View className="m-4 mb-8">
      <Heading3 className="mt-5 mb-1">{t( "Research-Grade-Status" )}</Heading3>
      <Body3>{qualityGradeText()}</Body3>
    </View>
  );
};

export default StatusSection;
