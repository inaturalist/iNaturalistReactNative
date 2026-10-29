import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import {
  Body2,
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
      return {
        title: t( "This-observation-is-Research-Grade" ),
        body: t( "The-community-agrees-on-an-identification" ),
      };
    }
    if ( qualityGrade === "needs_id" ) {
      return {
        title: t( "This-observation-needs-more-identifications--status-title" ),
        body: t( "Once-enough-people-agree-on-the-identification" ),
      };
    }
    return {
      title: t( "This-observation-is-casual" ),
      body: t( "Because-this-observation-is-of-a-pet-garden-plant-or-zoo-animal" ),
    };
  };
  const { title, body } = qualityGradeText( );

  return (
    <View className="mx-4 mt-8">
      <Heading3 className="text-base">{title}</Heading3>
      <Body2 className="mt-[9px]">{body}</Body2>
    </View>
  );
};

export default StatusSection;
