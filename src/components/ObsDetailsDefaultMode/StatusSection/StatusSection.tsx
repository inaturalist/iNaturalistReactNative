import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import {
  Body2,
  Button,
  Heading3,
  INatIcon,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { TabStackScreenProps } from "navigation/types";
import React from "react";
import { useCurrentUser } from "sharedHooks";
import colors from "styles/tailwindColors";

enum QUALITY_GRADE {
  RESEARCH = "research",
  NEEDS_ID = "needs_id",
  CASUAL = "casual",
}

interface Props {
  observation: {
    qualityGrade?: QUALITY_GRADE;
    quality_grade?: QUALITY_GRADE;
    uuid: string;
  };
}

const StatusSection = ( { observation }: Props ) => {
  const navigation = useNavigation<TabStackScreenProps<"ObsDetails">["navigation"]>( );
  const currentUser = useCurrentUser( );

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
  const isEligibleForResearchGrade = qualityGrade === "research" || qualityGrade === "needs_id";

  return (
    <View
      className={classnames( "px-[15px] py-5", {
        "bg-lightGreen": isEligibleForResearchGrade,
        "bg-lightGray": !isEligibleForResearchGrade,
      } )}
    >
      <View className="flex-row items-center gap-x-3">
        <Heading3 className="text-base shrink">{title}</Heading3>
        {qualityGrade === "research" && (
          <INatIcon name="checkmark-circle" size={19} color={colors.inatGreen} />
        )}
      </View>
      <Body2 className="mt-[9px]">{body}</Body2>
      {currentUser && (
        <Button
          className="mt-[17px] bg-transparent"
          testID="StatusSection.DQA"
          text={t( "DATA-QUALITY-ASSESSMENT" )}
          onPress={( ) => navigation.navigate( "DataQualityAssessment", {
            observationUUID: observation.uuid,
          } )}
        />
      )}
    </View>
  );
};

export default StatusSection;
