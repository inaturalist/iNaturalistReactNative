import classNames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import {
  CommentsCount,
  IdentificationsCount,
  QualityGradeStatus
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback } from "react";
import type { RealmObservation } from "realmModels/types";
import colors from "styles/tailwindColors";

interface Props {
  observation: RealmObservation;
  layout?: "horizontal" | "vertical";
  white?: boolean;
  classNameMargin?: string;
  testID?: string;
  simpleObsStatus?: boolean;
}

const ObsStatus = ( {
  observation,
  white,
  layout = "vertical",
  classNameMargin,
  testID,
  simpleObsStatus
}: Props ) => {
  const margin = layout === "vertical"
    ? "mb-1 ml-1"
    : "mr-2";

  const identificationsFilled = observation?.identifications_viewed === false;
  const showCurrentIdCount = useCallback( ( ) => {
    let numCurrentIdents = observation?.identifications?.filter(
      id => id.current === true
    )?.length || 0;
    if ( numCurrentIdents === 0 && observation?.taxon ) {
      numCurrentIdents = 1;
    }

    return (
      <IdentificationsCount
        classNameMargin={margin}
        count={numCurrentIdents}
        white={white}
        filled={identificationsFilled}
      />
    );
  }, [observation, margin, white, identificationsFilled] );

  const commentsFilled = observation?.comments_viewed === false;
  const showCommentCount = useCallback( ( ) => {
    const numComments = observation?.comments?.length || 0;

    return (
      <CommentsCount
        classNameMargin={margin}
        count={numComments}
        white={white}
        filled={commentsFilled}
        testID="ObsStatus.commentsCount"
      />
    );
  }, [observation, margin, white, commentsFilled] );

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

  if ( simpleObsStatus ) {
    if ( identificationsFilled || commentsFilled ) {
      return (
        <View
          className={classNames( "flex-1 justify-center items-end", classNameMargin )}
          testID={testID}
        >
          <View
            className="h-[10px] w-[10px] rounded-full bg-inatGreen"
          />
        </View>
      );
    }
    return null;
  }

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
