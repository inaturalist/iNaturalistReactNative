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
import Observation from "realmModels/Observation";
import colors from "styles/tailwindColors";

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
  const margin = layout === "vertical"
    ? "mb-1 ml-1"
    : "mr-2";

  const showCurrentIdCount = useCallback( ( ) => {
    let numCurrentIdents = observation?.identifications?.filter(
      id => id.current === true
    )?.length || 0;
    if ( numCurrentIdents === 0 && observation?.taxon ) {
      numCurrentIdents = 1;
    }
    const identificationsFilled = observation?.identifications_viewed === false;

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
    const numComments = observation?.comments?.length || 0;
    const commentsFilled = observation?.comments_viewed === false;

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
      ? colors.inatGreen
      : colors.darkGray;
    const iconColor = white
      ? colors.white
      : iconColorResearchCheck;
    return <QualityGradeStatus qualityGrade={qualityGrade} color={iconColor} />;
  }, [observation, white] );

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
