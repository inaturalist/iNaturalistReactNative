import { render, screen } from "@testing-library/react-native";
import { Button } from "components/SharedComponents";
import React from "react";

// Create the above tests with a descirbe.each loop
describe.each( [["primary"], ["warning"], ["focus"], ["neutral"]] )(
  "Button %s",
  level => {
    it( "should render correctly", async () => {
      render( <Button level={level} text={`${level.toUpperCase()} BUTTON`} /> );
      // Snapshot test
      expect( screen ).toMatchSnapshot();
    } );

    it( "has no accessibility errors", async () => {
      const button = <Button level={level} text={`${level.toUpperCase()} BUTTON`} />;
      // Snapshot test
      expect( button ).toBeAccessible();
    } );

    describe( "when disabled", () => {
      it( "should render correctly", async () => {
        render( <Button level={level} text={`${level.toUpperCase()} DISABLED`} disabled /> );
        // Snapshot test
        expect( screen ).toMatchSnapshot();
      } );

      it( "has no accessibility errors", async () => {
        const button = (
          <Button level={level} text={`${level.toUpperCase()} DISABLED`} disabled />
        );
          // Snapshot test
        expect( button ).toBeAccessible();
      } );
    } );
  }
);
