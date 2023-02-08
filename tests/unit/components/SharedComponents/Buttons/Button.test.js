import { render, screen } from "@testing-library/react-native";
import { Button } from "components/SharedComponents";
import React from "react";

describe( "Button", () => {
  describe( "primary", () => {
    it( "renders correctly", async () => {
      render( <Button level="primary" text="PRIMARY BUTTON" /> );
      // Snapshot test
      expect( screen ).toMatchSnapshot();
    } );

    it( "has no accessibility errors", async () => {
      const button = <Button level="primary" text="PRIMARY BUTTON" />;
      // Snapshot test
      expect( button ).toBeAccessible();
    } );
  } );

  describe( "neutral", () => {
    it( "renders correctly", async () => {
      render( <Button text="NEUTRAL BUTTON" /> );
      // Snapshot test
      expect( screen ).toMatchSnapshot();
    } );

    it( "has no accessibility errors", async () => {
      const button = <Button text="NEUTRAL BUTTON" />;
      // Snapshot test
      expect( button ).toBeAccessible();
    } );
  } );

  describe( "focus", () => {
    it( "renders correctly", async () => {
      render( <Button level="focus" text="FOCUS BUTTON" /> );
      // Snapshot test
      expect( screen ).toMatchSnapshot();
    } );

    it( "has no accessibility errors", async () => {
      const button = <Button level="focus" text="FOCUS BUTTON" />;
      // Snapshot test
      expect( button ).toBeAccessible();
    } );
  } );

  describe( "warning", () => {
    it( "renders correctly", async () => {
      render( <Button level="warning" text="WARNING BUTTON" /> );
      // Snapshot test
      expect( screen ).toMatchSnapshot();
    } );

    it( "has no accessibility errors", async () => {
      const button = <Button level="warning" text="WARNING BUTTON" />;
      // Snapshot test
      expect( button ).toBeAccessible();
    } );
  } );

  describe( "primary disabled", () => {
    it( "renders correctly", async () => {
      render( <Button level="primary" text="PRIMARY DISABLED" disabled /> );
      // Snapshot test
      expect( screen ).toMatchSnapshot();
    } );

    it( "has no accessibility errors", async () => {
      const button = (
        <Button level="primary" text="PRIMARY DISABLED" disabled />
      );
      // Snapshot test
      expect( button ).toBeAccessible();
    } );
  } );

  describe( "neutral disabled", () => {
    it( "renders correctly", async () => {
      render( <Button text="NEUTRAL DISABLED" disabled /> );
      // Snapshot test
      expect( screen ).toMatchSnapshot();
    } );

    it( "has no accessibility errors", async () => {
      const button = <Button text="NEUTRAL DISABLED" disabled />;
      // Snapshot test
      expect( button ).toBeAccessible();
    } );
  } );

  describe( "focus disabled", () => {
    it( "renders correctly", async () => {
      render( <Button level="focus" text="FOCUS DISABLED" disabled /> );
      // Snapshot test
      expect( screen ).toMatchSnapshot();
    } );

    it( "has no accessibility errors", async () => {
      const button = <Button level="focus" text="FOCUS DISABLED" disabled />;
      // Snapshot test
      expect( button ).toBeAccessible();
    } );
  } );

  describe( "warning disabled", () => {
    it( "renders correctly", async () => {
      render( <Button level="warning" text="WARNING DISABLED" disabled /> );
      // Snapshot test
      expect( screen ).toMatchSnapshot();
    } );

    it( "has no accessibility errors", async () => {
      const button = (
        <Button level="warning" text="WARNING DISABLED" disabled />
      );
      // Snapshot test
      expect( button ).toBeAccessible();
    } );
  } );
} );
