import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import MediaViewer from "components/MediaViewer/MediaViewer";
import initI18next from "i18n/initI18next";
import React from "react";

import { renderComponent } from "../../../helpers/render";

describe( "MediaViewer", ( ) => {
  beforeAll( async () => {
    await initI18next();
  } );

  describe( "without media", ( ) => {
    it( "should not have accessibility errors", async () => {
      renderComponent( <MediaViewer /> );
      const mediaViewer = await screen.findByTestId( "MediaViewer" );
      expect( mediaViewer ).toBeAccessible( );
    } );

    it( "should not have any CustomImageZoom components", ( ) => {
      renderComponent( <MediaViewer /> );
      expect( screen.queryByTestId( "CustomImageZoom" ) ).toBeFalsy( );
    } );
  } );

  describe( "with media", ( ) => {
    const urls = [
      faker.image.url()
    ];

    it( "should not have accessibility errors", async () => {
      renderComponent( <MediaViewer urls={urls} /> );
      const mediaViewer = await screen.findByTestId( "MediaViewer" );
      expect( mediaViewer ).toBeAccessible( );
    } );

    it( "should have a CustomImageZoom component", async ( ) => {
      renderComponent( <MediaViewer urls={urls} /> );
      expect( await screen.findByTestId( "CustomImageZoom" ) ).toBeTruthy( );
    } );

    describe( "when editable", ( ) => {
      it( "should show the delete button", async ( ) => {
        renderComponent( <MediaViewer urls={urls} editable /> );
        expect( await screen.findByLabelText( "Delete" ) ).toBeTruthy( );
      } );
    } );

    describe( "when not editable", ( ) => {
      it( "should not show the delete button", async ( ) => {
        renderComponent( <MediaViewer urls={urls} /> );
        expect( await screen.findByTestId( "CustomImageZoom" ) ).toBeTruthy( );
        expect( screen.queryByLabelText( "Delete" ) ).toBeFalsy( );
      } );
    } );
  } );
} );
