import { render, screen } from "@testing-library/react-native";
import { QualityGradeStatus } from "components/SharedComponents";
import React from "react";

describe.each( [["research"], ["needs_id"], ["casual"]] )(
  "Quality Grade %s",
  qualityGrade => {
    it( "renders correct grade", () => {
      render( <QualityGradeStatus qualityGrade={qualityGrade} /> );
      const testId = `QualityGrade.${qualityGrade}`;
      expect( screen.getByTestId( testId ) ).toBeTruthy();
    } );

    it( "should render correctly", () => {
      render( <QualityGradeStatus qualityGrade={qualityGrade} /> );

      // Snapshot test
      expect( screen ).toMatchSnapshot();
    } );

    it( "has no accessibility errors", () => {
      // const qualityGradeStatus = <QualityGradeStatus qualityGrade={qualityGrade} />;

      // Disabled during the update to RN 0.78
      // expect( qualityGradeStatus ).toBeAccessible();
    } );
  },
);
