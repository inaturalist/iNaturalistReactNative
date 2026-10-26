import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import {
  Body3,
  Heading3,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React from "react";

enum QUALITY_GRADE {
  RESEARCH = "research",
  NEEDS_ID = "needs_id",
  CASUAL = "casual",
}

interface Props {
  observation: {
    qualityGrade?: QUALITY_GRADE;
    quality_grade?: QUALITY_GRADE;
  };
}

const StatusSection = ( { observation }: Props ) => {
  if ( !observation ) return null;

  const qualityGrade = checkCamelAndSnakeCase( observation, "qualityGrade" );
  const qualityGradeText = ( ) => {
    if ( qualityGrade === "research" ) {
      return t( "This-observation-is-research-grade-and-can-be-used-by-scientists" );
    }
    if ( qualityGrade === "needs_id" ) {
      return t( "This-observation-needs-more-identifications-to-become-research-grade" );
    }
    return t( "This-observation-is-not-eligible-for-research-grade-status" );
  };

  return (
    <View className="mx-4 mt-8">
      <Heading3>{t( "Research-Grade-Status" )}</Heading3>
      <Body3 className="mt-3">{qualityGradeText( )}</Body3>
    </View>
  );
};

export default StatusSection;
