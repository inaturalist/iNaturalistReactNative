import { render, screen } from "@testing-library/react-native";
import { Button } from "components/SharedComponents";
import React from "react";

describe.each( [["primary"], ["warning"], ["focus"], ["neutral"]] )(
  "Button %s",
  level => {
    it( "should render correctly", () => {
      render( <Button level={level} text={`${level.toUpperCase()} BUTTON`} /> );

      // Snapshot test
      expect( screen ).toMatchSnapshot();
    } );

    it( "has no accessibility errors", () => {
      // const button = <Button level={level} text={`${level.toUpperCase()} BUTTON`} />;

      // Disabled during the update to RN 0.78
      // expect( button ).toBeAccessible();
    } );

    describe( "when disabled", () => {
      it( "should render correctly", () => {
        render( <Button level={level} text={`${level.toUpperCase()} DISABLED`} disabled /> );

        // Snapshot test
        expect( screen ).toMatchSnapshot();
      } );

      it( "has no accessibility errors", () => {
        // const button = (
        //   <Button level={level} text={`${level.toUpperCase()} DISABLED`} disabled />
        // );

        // Disabled during the update to RN 0.78
        // expect( button ).toBeAccessible();
      } );
    } );
  }
);
