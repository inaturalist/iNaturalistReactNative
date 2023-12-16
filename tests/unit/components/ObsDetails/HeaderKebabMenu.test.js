import { fireEvent, screen } from "@testing-library/react-native";
import PhotoDisplayContainer from "components/ObsDetails/PhotoDisplayContainer";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import React from "react";
import { Share } from "react-native";
// eslint-disable-next-line import/no-unresolved
import mockPlatform from "react-native/Libraries/Utilities/Platform";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockObservation = factory( "LocalObservation", {
  id: 1906
} );

jest.mock( "react-native/Libraries/Share/Share", () => ( {
  share: jest.fn( () => Promise.resolve( "mockResolve" ) )
} ) );

jest.mock( "react-native/Libraries/Utilities/Platform", ( ) => ( {
  OS: "ios",
  select: jest.fn( )
} ) );

describe( "HeaderKebabMenu", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "renders and opens kebab menu share button", async ( ) => {
    renderComponent(
      <PhotoDisplayContainer
        observation={mockObservation}
        refetchRemoteObservation={jest.fn( )}
        isOnline
        belongsToCurrentUser={false}
      />
    );

    const anchorButton = screen.getByLabelText( i18next.t( "Observation-options" ) );
    expect( anchorButton ).toBeTruthy( );
    fireEvent.press( anchorButton );
    const shareButton = await screen.findByTestId( "MenuItem.Share" );
    expect( shareButton ).toBeTruthy( );
  } );

  it( "does not render when observation belongs to current user", ( ) => {
    renderComponent(
      <PhotoDisplayContainer
        observation={mockObservation}
        refetchRemoteObservation={jest.fn( )}
        isOnline
        belongsToCurrentUser
      />
    );
    const editButton = screen.getByTestId( "ObsDetail.editButton" );
    expect( editButton ).toBeVisible( );
    const anchorButton = screen.queryByLabelText( i18next.t( "Observation-options" ) );
    expect( anchorButton ).toBeFalsy( );
  } );

  it( "opens native share dialog with expected url", async ( ) => {
    const url = `https://www.inaturalist.org/observations/${mockObservation.id.toString( )}`;
    renderComponent(
      <PhotoDisplayContainer
        observation={mockObservation}
        refetchRemoteObservation={jest.fn( )}
        isOnline
        belongsToCurrentUser={false}
      />
    );

    const anchorButton = screen.getByLabelText( i18next.t( "Observation-options" ) );
    expect( anchorButton ).toBeTruthy( );
    fireEvent.press( anchorButton );
    const shareButton = await screen.findByTestId( "MenuItem.Share" );
    expect( shareButton ).toBeTruthy( );
    fireEvent.press( shareButton );
    expect( Share.share ).toHaveBeenCalledTimes( 1 );
    expect( Share.share ).toHaveBeenCalledWith( { message: "", url } );
  } );

  it( "opens native share dialog with expected message on android", async ( ) => {
    mockPlatform.OS = "android";
    const url = `https://www.inaturalist.org/observations/${mockObservation.id.toString( )}`;
    renderComponent(
      <PhotoDisplayContainer
        observation={mockObservation}
        refetchRemoteObservation={jest.fn( )}
        isOnline
        belongsToCurrentUser={false}
      />
    );

    const anchorButton = screen.getByLabelText( i18next.t( "Observation-options" ) );
    expect( anchorButton ).toBeTruthy( );
    fireEvent.press( anchorButton );
    const shareButton = await screen.findByTestId( "MenuItem.Share" );
    expect( shareButton ).toBeTruthy( );
    fireEvent.press( shareButton );
    expect( Share.share ).toHaveBeenCalledWith( { message: url, url: "" } );
  } );
} );
