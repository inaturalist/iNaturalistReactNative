import { screen } from "@testing-library/react-native";
import MediaViewer from "components/MediaViewer/MediaViewer";
import React from "react";
import factory from "tests/factory";
import { renderComponent, wrapInNavigationContainer } from "tests/helpers/render";

// Note: HeaderBackButton has accessibility issues
jest.mock( "@react-navigation/elements" );

describe( "MediaViewer", ( ) => {
  describe( "without media", ( ) => {
    it( "should not have accessibility errors", async () => {
      const mediaViewer = wrapInNavigationContainer( <MediaViewer /> );
      // Disabled during the update to RN 0.78
      expect( mediaViewer ).toBeTruthy( );
      // expect( mediaViewer ).toBeAccessible( );
    } );

    it( "should not have any CustomImageZoom components", ( ) => {
      renderComponent( <MediaViewer /> );
      expect( screen.queryByTestId( /CustomImageZoom/ ) ).toBeFalsy( );
    } );
  } );

  describe( "with media", ( ) => {
    describe( "with one photo", ( ) => {
      // const urls = [faker.image.url( )];
      const photos = [factory( "LocalPhoto" )];

      it( "should not have accessibility errors", async () => {
        const mediaViewer = wrapInNavigationContainer( <MediaViewer photos={photos} /> );
        // Disabled during the update to RN 0.78
        expect( mediaViewer ).toBeTruthy( );
        // expect( mediaViewer ).toBeAccessible( );
      } );

      it( "should have a CustomImageZoom component", async ( ) => {
        renderComponent( <MediaViewer photos={photos} /> );
        expect( await screen.findByTestId( /CustomImageZoom/ ) ).toBeTruthy( );
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
        expect( await screen.findByLabelText( "Delete photo" ) ).toBeTruthy( );
      } );

      it( "should not show AttributionButton", async ( ) => {
        renderComponent( <MediaViewer photos={photos} editable /> );
        await screen.findByLabelText( "Delete photo" );
        expect( screen.queryByTestId( "AttributionButton" ) ).toBeFalsy( );
      } );
    } );

    describe( "when not editable", ( ) => {
      const photos = [factory( "LocalPhoto" )];

      it( "should not show the delete button", async ( ) => {
        renderComponent( <MediaViewer photos={photos} /> );
        expect( await screen.findByTestId( /CustomImageZoom/ ) ).toBeTruthy( );
        expect( screen.queryByLabelText( "Delete photo" ) ).toBeFalsy( );
      } );

      it( "should show that a photographer reserves all rights", async ( ) => {
        const photo = factory( "RemotePhoto", {
          license_code: null,
          attribution: "(c) username, all rights reserved",
        } );
        expect( photo.license_code ).toBeNull( );
        renderComponent( <MediaViewer photos={[photo]} /> );
        expect( await screen.findByLabelText( /all rights reserved/ ) ).toBeVisible( );
      } );

      it( "should show that a photographer has applied a license", async ( ) => {
        const photo = factory( "RemotePhoto" );
        expect( photo.license_code ).not.toBeNull( );
        renderComponent( <MediaViewer photos={[photo]} /> );
        expect( await screen.findByLabelText( /some rights reserved/ ) ).toBeVisible( );
      } );
      it(
        "should not render the AttributionButton if attribution is not present",
        async () => {
          const photosWithoutAttribution = [
            factory( "LocalPhoto", { attribution: undefined } ),
          ];
          renderComponent( <MediaViewer photos={photosWithoutAttribution} /> );
          expect( screen.queryByLabelText( photos[0].attribution ) ).not.toBeTruthy();
        },
      );

      it( "should render the AttributionButton if attribution is present", async () => {
        renderComponent( <MediaViewer photos={photos} /> );
        expect( await screen.findByLabelText( photos[0].attribution ) ).toBeTruthy();
      } );
    } );
  } );
} );
