import { screen } from "@testing-library/react-native";
import MediaViewer from "components/MediaViewer/MediaViewer";
import initI18next from "i18n/initI18next";
import React from "react";

import factory from "../../../factory";
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
    describe( "with one photo", ( ) => {
      // const urls = [faker.image.url( )];
      const photos = [factory( "LocalPhoto" )];

      it( "should not have accessibility errors", async () => {
        renderComponent( <MediaViewer photos={photos} /> );
        const mediaViewer = await screen.findByTestId( "MediaViewer" );
        expect( mediaViewer ).toBeAccessible( );
      } );

      it( "should have a CustomImageZoom component", async ( ) => {
        renderComponent( <MediaViewer photos={photos} /> );
        expect( await screen.findByTestId( "CustomImageZoom" ) ).toBeTruthy( );
      } );
    } );

    describe( "with multiple photos", ( ) => {
      it.todo( "should show the image specified by the uri prop" );
      // As currently implemented, all images are in a flatlist and all get
      // rendered and are "visible" according to "toBeVisible", so I'm not
      // uet sure how to test this
      // it( "should show the url specified in the defaultUrl prop", async ( ) => {
      //   const urls = [
      //     faker.image.url( ),
      //     faker.image.url( )
      //   ];
      //   renderComponent( <MediaViewer defaultUrl={urls[1]} urls={urls} /> );
      //   expect( await screen.findByTestId( `CustomImageZoom.${urls[1]}` ) ).toBeVisible( );
      //   expect( await screen.findByTestId( `xxCustomImageZoom.${urls[0]}` ) ).not.toBeVisible( );
      // } );
    } );

    describe( "when editable", ( ) => {
      const photos = [factory( "LocalPhoto" )];

      it( "should show the delete button", async ( ) => {
        renderComponent( <MediaViewer photos={photos} editable /> );
        expect( await screen.findByLabelText( "Delete" ) ).toBeTruthy( );
      } );

      it.todo( "should not show that a photographer reserves all rights" );
      it.todo( "should not show that a photographer has applied a license" );
    } );

    describe( "when not editable", ( ) => {
      const photos = [factory( "LocalPhoto" )];

      it( "should not show the delete button", async ( ) => {
        renderComponent( <MediaViewer photos={photos} /> );
        expect( await screen.findByTestId( "CustomImageZoom" ) ).toBeTruthy( );
        expect( screen.queryByLabelText( "Delete" ) ).toBeFalsy( );
      } );

      it.todo( "should show that a photographer reserves all rights" );
      it.todo( "should show that a photographer has applied a license" );
    } );
  } );
} );
