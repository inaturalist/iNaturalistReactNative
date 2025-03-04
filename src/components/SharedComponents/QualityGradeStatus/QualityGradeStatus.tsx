import { View } from "components/styledComponents";
import { t } from "i18next";
import CasualGrade from "images/svg/casual_grade.svg";
import NeedsIdGrade from "images/svg/needs_id_grade.svg";
import ResearchGrade from "images/svg/research_grade.svg";
import * as React from "react";
import colors from "styles/tailwindColors";

interface Props {
  qualityGrade: string | null,
  color?: string,
  opacity?: number
}

const qualityGradeSVG = (
  qualityGrade: string | null,
  color: string,
  opacity: number
) => {
  if ( qualityGrade === "research" ) {
    return (
      <ResearchGrade
        accessible
        accessibilityLabel={t( "Quality-Grade-Research--label" )}
        testID="QualityGrade.research"
        color={color}
        opacity={opacity}
      />
    );
  }
  if ( qualityGrade === "needs_id" ) {
    return (
      <NeedsIdGrade
        accessible
        accessibilityLabel={t( "Quality-Grade-Needs-ID--label" )}
        testID="QualityGrade.needs_id"
        color={color}
        opacity={opacity}
      />
    );
  }
  return (
    <CasualGrade
      accessible
      accessibilityLabel={t( "Quality-Grade-Casual--label" )}
      testID="QualityGrade.casual"
      color={color}
      opacity={opacity}
    />
  );
};

const QualityGradeStatus = ( { qualityGrade, color, opacity }: Props ) => {
  const svgColor = color || colors.darkGray;
  const svgOpacity = opacity || 1;
  return (
    <View>{qualityGradeSVG( qualityGrade, svgColor, svgOpacity )}</View>
  );
};

export default QualityGradeStatus;
