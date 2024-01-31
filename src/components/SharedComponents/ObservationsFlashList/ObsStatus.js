// @flow

import classNames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import {
  CommentsCount,
  IdentificationsCount,
  QualityGradeStatus
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { useTheme } from "react-native-paper";
import Observation from "realmModels/Observation";

type Props = {
  observation: typeof Observation,
  layout?: "horizontal" | "vertical",
  white?: boolean,
  classNameMargin?: string,
  testID?: string
};
/* eslint-disable react-native/no-inline-styles */
const ObsStatus = ( {
  observation,
  white,
  layout = "vertical",
  classNameMargin,
  testID
}: Props ): Node => {
  const theme = useTheme();
  const margin = layout === "vertical"
    ? "mb-1 ml-1"
    : "mr-2";

  const showCurrentIdCount = useCallback( ( ) => {
    const numCurrentIdents = observation
      .identifications?.filter( id => id.current === true )?.length || 0;
    const identificationsFilled = observation.identifications_viewed === false;

    return (
      <IdentificationsCount
        classNameMargin={margin}
        count={numCurrentIdents}
        white={white}
        filled={identificationsFilled}
      />
    );
  }, [observation, margin, white] );

  const showCommentCount = useCallback( ( ) => {
    const numComments = observation.comments?.length || 0;
    const commentsFilled = observation.comments_viewed === false;

    return (
      <CommentsCount
        classNameMargin={margin}
        count={numComments}
        white={white}
        filled={commentsFilled}
        testID="ObsStatus.commentsCount"
      />
    );
  }, [observation, margin, white] );

  const showQualityGrade = useCallback( ( ) => {
    const qualityGrade = checkCamelAndSnakeCase( observation, "qualityGrade" );
    const iconColorResearchCheck = qualityGrade === "research"
      ? theme.colors.secondary
      : theme.colors.primary;
    const iconColor = white
      ? theme.colors.onPrimary
      : iconColorResearchCheck;
    return <QualityGradeStatus qualityGrade={qualityGrade} color={iconColor} />;
  }, [observation, theme, white] );

  console.log( classNameMargin, "flex direction", margin );

  return (
    <View
      className={classNames( {
        "flex-row": layout === "horizontal"
      }, classNameMargin )}
      testID={testID}
    >
      {showCurrentIdCount( )}
      {showCommentCount( )}
      {showQualityGrade( )}
    </View>
  );
};

export default ObsStatus;
