import { fireEvent, screen } from "@testing-library/react-native";
import HeaderKebabMenu from "components/ObsDetailsDefaultMode/HeaderKebabMenu";
import i18next from "i18next";
import React from "react";
import { Platform, Share } from "react-native";
import { renderComponent } from "tests/helpers/render";

jest.mock( "react-native/Libraries/Share/Share", () => ( {
  __esModule: true,
  default: {
    share: jest.fn( () => Promise.resolve( "mockResolve" ) ),
  },
} ) );

jest.mock( "react-native/Libraries/Utilities/Platform", () => ( {
  __esModule: true,
  default: {
    OS: "ios",
    select: jest.fn(),
  },
} ) );

const observationId = 1234;
const url = `https://www.inaturalist.org/observations/${observationId}`;

describe( "HeaderKebabMenu", () => {
  it( "renders and opens kebab menu share button", async ( ) => {
    renderComponent( <HeaderKebabMenu observationId={observationId} /> );
    const anchorButton = screen.getByLabelText( i18next.t( "Observation-options" ) );
    expect( anchorButton ).toBeTruthy( );
    fireEvent.press( anchorButton );
    const shareButton = await screen.findByTestId( "MenuItem.Share" );
    expect( shareButton ).toBeTruthy( );
  } );

  it( "opens native share dialog with expected url", async ( ) => {
    renderComponent( <HeaderKebabMenu observationId={observationId} /> );
    const anchorButton = screen.getByLabelText( i18next.t( "Observation-options" ) );
    expect( anchorButton ).toBeTruthy( );
    fireEvent.press( anchorButton );
    const shareButton = await screen.findByTestId( "MenuItem.Share" );
    expect( shareButton ).toBeTruthy( );
    fireEvent.press( shareButton );
    expect( Share.share ).toHaveBeenCalledTimes( 1 );
    expect( Share.share ).toHaveBeenCalledWith( { message: "", url } );
  } );

  const defaultPlatformOS = Platform.OS;

  describe( "on Android", ( ) => {
    // TODO change this to a less brittle and sweeping approach. Some ideas at
    // https://stackoverflow.com/questions/43161416/mocking-platform-detection-in-jest-and-react-native
    beforeAll( ( ) => {
      Platform.OS = "android";
    } );

    afterAll( ( ) => {
      Platform.OS = defaultPlatformOS;
    } );

    it( "opens native share dialog with expected message", async ( ) => {
      renderComponent( <HeaderKebabMenu observationId={observationId} /> );
      const anchorButton = screen.getByLabelText( i18next.t( "Observation-options" ) );
      expect( anchorButton ).toBeTruthy( );
      fireEvent.press( anchorButton );
      const shareButton = await screen.findByTestId( "MenuItem.Share" );
      expect( shareButton ).toBeTruthy( );
      fireEvent.press( shareButton );
      expect( Share.share ).toHaveBeenCalledWith( { message: url, url: "" } );
    } );
  } );
} );
